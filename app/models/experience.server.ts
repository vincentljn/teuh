import type { Experience } from "@prisma/client";
import { prisma } from '~/db.server'

export const getExperiences = async () => {
	return await prisma.experience.findMany({
		select: { id: true, name: true, value: true },
		orderBy: { order: 'asc' },
	})
}

export const getExperience = async (id: number) => {
	return await prisma.experience.findFirst({
		where: { id },
	})
}

export const updateExperience = async (experience: Pick<Experience, 'id'|'value'>) => {
	return await prisma.experience.update({
		where: {
			id: experience.id
		},
		data: {
			value: experience.value
		}
	})
}
