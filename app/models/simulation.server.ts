import type { Experience, Job, Seniority, Simulation, User } from '@prisma/client'
import { prisma } from '~/db.server'

export const calculateSalary = async (
	values: {
		job: Job
		experience: Experience
		seniority: Seniority
	} | null
) => {
	if (!values) return 0
	const { job, experience, seniority } = values
	if (!values.job || !experience || !seniority) return 0
	return job.value * experience.value + seniority.value
}

export const getSimulations = async (userId: User['id']) => {
	return await prisma.simulation.findMany({
		where: { userId },
		select: { id: true, name: true, job: true, experience: true, seniority: true, salary: true },
		orderBy: { id: 'desc' },
	})
}

export const getSimulation = async (
	values: Pick<Simulation, 'id'>,
	userId: User['id'],
	includeRelations: boolean = false
) => {
	return await prisma.simulation.findFirst({
		where: { id: values.id, userId },
		include: {
			job: includeRelations,
			experience: includeRelations,
			seniority: includeRelations,
		},
	})
}

export const createSimulation = async (
	values: { name: string; jobId: number; experienceId: number; seniorityId: number; salary: number },
	userId: User['id']
) => {
	if (!values) return null
	const { name, jobId, experienceId, seniorityId, salary } = values
	return await prisma.simulation.create({
		data: {
			name,
			jobId,
			experienceId,
			seniorityId,
			salary,
			userId,
		},
	})
}

export const updateSimulation = async (values: Partial<Simulation> | null) => {
	if (!values) return null
	const { id, name, jobId, experienceId, seniorityId, salary } = values
	if (!id) return null
	return await prisma.simulation.update({
		where: {
			id,
		},
		data: {
			name,
			jobId,
			experienceId,
			seniorityId,
			salary,
		},
	})
}

export const deleteSimulation = async (values: Pick<Simulation, 'id'>) => {
	return await prisma.simulation.delete({
		where: { id: values.id },
	})
}
