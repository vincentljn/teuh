import type { Job } from "@prisma/client";
import { prisma } from '~/db.server'

export const getJobs = async () => {
	return await prisma.job.findMany({
		select: { id: true, name: true, value: true },
		orderBy: { order: 'asc' },
	})
}

export const getJob = async (id: number) => {
	return await prisma.job.findFirst({
		where: { id },
	})
}

export const updateJob = async (job: Pick<Job, 'id'|'value'>) => {
	return await prisma.job.update({
		where: {
			id: job.id
		},
		data: {
			value: job.value
		}
	})
}
