import OpenAI from "openai";

// Inicializar OpenAI apenas se a chave estiver disponível
// Não lançar erro no build, apenas quando a função for chamada
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

// Criar instância lazy - só será criada quando necessário
let openaiInstance: OpenAI | null = null;

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!openaiInstance) {
      openaiInstance = getOpenAIClient();
    }
    const value = openaiInstance[prop as keyof OpenAI];
    return typeof value === 'function' ? value.bind(openaiInstance) : value;
  },
});

export async function generateDesignPrompt(userPrompt: string, brandStyle?: string) {
  const systemPrompt = `Você é um especialista em design de estampas para roupas. 
Crie prompts detalhados e criativos para geração de imagens de estampas.
Estilo da marca: ${brandStyle || "variado"}
O usuário quer: ${userPrompt}

Retorne apenas o prompt otimizado, sem explicações adicionais.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  return completion.choices[0].message.content || userPrompt;
}

export async function generateDesignImage(prompt: string) {
  const optimizedPrompt = `High quality t-shirt design, ${prompt}, transparent background, vector style, print ready, 300 DPI, professional`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: optimizedPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "url",
  });

  if (!response.data || response.data.length === 0 || !response.data[0].url) {
    throw new Error("Falha ao gerar imagem: resposta vazia da OpenAI");
  }

  return response.data[0].url;
}

export async function generateBrandName(description: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Você é um especialista em naming de marcas de moda. Crie nomes criativos, modernos e memoráveis.",
      },
      {
        role: "user",
        content: `Crie 3 nomes de marca de roupas baseado em: ${description}`,
      },
    ],
    temperature: 0.9,
    max_tokens: 150,
  });

  return completion.choices[0].message.content || "";
}

export async function generateBrandDescription(name: string, style: string, targetAudience: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Você é um copywriter especializado em descrições de marcas de moda. Crie textos envolventes e autênticos.",
      },
      {
        role: "user",
        content: `Crie uma descrição curta e impactante para a marca ${name}, estilo ${style}, público-alvo: ${targetAudience}`,
      },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  return completion.choices[0].message.content || "";
}


