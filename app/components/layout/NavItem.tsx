import type { ReactNode } from 'react'
import type { To } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Anchor, Group, Text, UnstyledButton } from '@mantine/core'

type NavItemProps = {
	label: string
	icon: ReactNode
	to: To
}

export default ({ label, icon, to }: NavItemProps) => (
	<Anchor component={Link} to={to} variant="text">
		<UnstyledButton
			sx={(theme) => ({
				display: 'block',
				width: '100%',
				padding: theme.spacing.xs,
				borderRadius: theme.radius.sm,
				color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

				'&:hover': {
					backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
				},
			})}
		>
			<Group>
				{icon}
				<Text>{label}</Text>
			</Group>
		</UnstyledButton>
	</Anchor>
)
