import type { Seniority } from "@prisma/client";
import { prisma } from '~/db.server'

export const getSeniorities = async () => {
	return await prisma.seniority.findMany({
		select: { id: true, name: true, value: true },
		orderBy: { order: 'asc' },
	})
}

export const getSeniority = async (id: number) => {
	return await prisma.seniority.findFirst({
		where: { id },
	})
}

export const updateSeniority = async (seniority: Pick<Seniority, 'id'|'value'>) => {
	return await prisma.seniority.update({
		where: {
			id: seniority.id
		},
		data: {
			value: seniority.value
		}
	})
}
