import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { DeviceGroup } from './entities/device-group.entity'
import { CreateDeviceGroupDto } from './dto/create-device-group.dto'
import { UpdateDeviceGroupDto } from './dto/update-device-group.dto'
import { DevicesService } from '../devices/devices.service'
import { Device } from '../devices/entities/device.entity'

@Injectable()
export class DeviceGroupsService {
  constructor(
    @InjectRepository(DeviceGroup)
    private groupsRepository: Repository<DeviceGroup>,
    private devicesService: DevicesService,
  ) {}

  async create(createGroupDto: CreateDeviceGroupDto): Promise<DeviceGroup> {
    const group = this.groupsRepository.create({
      name: createGroupDto.name,
      description: createGroupDto.description,
      company_id: createGroupDto.company_id,
    })

    const saved = await this.groupsRepository.save(group)

    // Adicionar dispositivos se fornecidos
    if (createGroupDto.device_ids && createGroupDto.device_ids.length > 0) {
      await this.addDevicesToGroup(saved.id, createGroupDto.device_ids)
    }

    return this.findOne(saved.id)
  }

  async findAll(): Promise<DeviceGroup[]> {
    return this.groupsRepository.find({
      relations: ['devices'],
      order: { created_at: 'DESC' },
    })
  }

  async findOne(id: string): Promise<DeviceGroup> {
    return this.groupsRepository.findOne({
      where: { id },
      relations: ['devices'],
    })
  }

  async update(id: string, updateGroupDto: UpdateDeviceGroupDto): Promise<DeviceGroup> {
    const group = await this.findOne(id)
    if (!group) {
      throw new Error('Device group not found')
    }

    Object.assign(group, {
      name: updateGroupDto.name ?? group.name,
      description: updateGroupDto.description ?? group.description,
      company_id: updateGroupDto.company_id ?? group.company_id,
    })

    const saved = await this.groupsRepository.save(group)

    // Atualizar dispositivos se fornecidos
    if (updateGroupDto.device_ids !== undefined) {
      await this.setGroupDevices(id, updateGroupDto.device_ids)
    }

    return this.findOne(saved.id)
  }

  async remove(id: string): Promise<void> {
    const group = await this.findOne(id)
    if (group) {
      await this.groupsRepository.remove(group)
    }
  }

  async addDevicesToGroup(groupId: string, deviceIds: string[]): Promise<DeviceGroup> {
    const group = await this.findOne(groupId)
    if (!group) {
      throw new Error('Device group not found')
    }

    // deviceIds podem ser UUIDs ou IDs - buscar todos e filtrar
    const allDevices = await this.devicesService.findAll()
    const selectedDevices = deviceIds
      .map(id => allDevices.find(d => d.id === id || d.uuid === id))
      .filter(d => d !== undefined) as Device[]

    const existingDeviceIds = (group.devices || []).map(d => d.id)
    const newDevices = selectedDevices.filter(d => !existingDeviceIds.includes(d.id))

    group.devices = [...(group.devices || []), ...newDevices]
    await this.groupsRepository.save(group)

    return this.findOne(groupId)
  }

  async removeDevicesFromGroup(groupId: string, deviceIds: string[]): Promise<DeviceGroup> {
    const group = await this.findOne(groupId)
    if (!group) {
      throw new Error('Device group not found')
    }

    // deviceIds podem ser UUIDs ou IDs
    group.devices = (group.devices || []).filter(d => 
      !deviceIds.includes(d.uuid) && !deviceIds.includes(d.id)
    )
    await this.groupsRepository.save(group)

    return this.findOne(groupId)
  }

  async setGroupDevices(groupId: string, deviceIds: string[]): Promise<DeviceGroup> {
    const group = await this.findOne(groupId)
    if (!group) {
      throw new Error('Device group not found')
    }

    // deviceIds podem ser UUIDs ou IDs - buscar todos e filtrar
    const allDevices = await this.devicesService.findAll()
    const selectedDevices = deviceIds
      .map(id => allDevices.find(d => d.id === id || d.uuid === id))
      .filter(d => d !== undefined) as Device[]

    group.devices = selectedDevices
    await this.groupsRepository.save(group)

    return this.findOne(groupId)
  }

  // Aplicar ação em todos os dispositivos do grupo
  async applyActionToGroup(groupId: string, action: string, value: any): Promise<void> {
    const group = await this.findOne(groupId)
    if (!group) {
      throw new Error('Device group not found')
    }

    for (const device of group.devices || []) {
      try {
        switch (action) {
          case 'volume':
            await this.devicesService.update(device.uuid, { volume: parseInt(value) })
            break
          case 'stream_url':
            await this.devicesService.update(device.uuid, { streaming_url: value })
            break
          case 'status':
            await this.devicesService.update(device.uuid, { status: value })
            break
        }
      } catch (error) {
        console.error(`Erro ao aplicar ação no dispositivo ${device.uuid}:`, error)
      }
    }
  }
}

