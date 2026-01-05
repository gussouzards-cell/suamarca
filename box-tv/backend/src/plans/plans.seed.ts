import { DataSource } from 'typeorm';
import { Plan } from './entities/plan.entity';

export async function seedPlans(dataSource: DataSource) {
  const planRepository = dataSource.getRepository(Plan);

  const defaultPlans = [
    {
      name: 'Básico',
      description: 'Plano básico para pequenas empresas',
      price_per_device: 29.90,
      min_devices: 1,
      max_devices: 10,
      credit_per_device: 1,
      active: true,
      features: {
        streaming: true,
        remote_control: true,
        basic_support: true,
      },
    },
    {
      name: 'Profissional',
      description: 'Plano profissional para empresas médias',
      price_per_device: 24.90,
      min_devices: 11,
      max_devices: 50,
      credit_per_device: 1,
      active: true,
      features: {
        streaming: true,
        remote_control: true,
        scheduling: true,
        priority_support: true,
      },
    },
    {
      name: 'Enterprise',
      description: 'Plano enterprise para grandes empresas',
      price_per_device: 19.90,
      min_devices: 51,
      max_devices: null,
      credit_per_device: 1,
      active: true,
      features: {
        streaming: true,
        remote_control: true,
        scheduling: true,
        device_groups: true,
        api_access: true,
        dedicated_support: true,
      },
    },
  ];

  for (const planData of defaultPlans) {
    const existingPlan = await planRepository.findOne({
      where: { name: planData.name },
    });

    if (!existingPlan) {
      const plan = planRepository.create(planData);
      await planRepository.save(plan);
      console.log(`✅ Plano "${planData.name}" criado`);
    } else {
      console.log(`ℹ️ Plano "${planData.name}" já existe`);
    }
  }
}






