import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import * as React from 'react'
import { Anchor, Button, Container, Group, InputWrapper, Space, Text, TextInput } from '@mantine/core'

import { getUserId, createUserSession } from '~/session.server'

import { createUser, getUserByEmail } from '~/models/user.server'
import { safeRedirect, validateEmail } from '~/utils'

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request)
	if (userId) return redirect('/')
	return json({})
}

interface ActionData {
	errors?: {
		email?: string
		password?: string
	}
	values?: {
		email?: string
		password?: string
		redirectTo?: string
	}
}

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData()
	const email = formData.get('email')
	const password = formData.get('password')
	const redirectTo = safeRedirect(formData.get('redirectTo'), '/')

	if (!validateEmail(email)) {
		return json<ActionData>({ errors: { email: 'Email is invalid' } }, { status: 400 })
	}

	if (typeof password !== 'string' || password.length === 0) {
		return json<ActionData>({ errors: { password: 'Password is required' } }, { status: 400 })
	}

	const existingUser = await getUserByEmail(email)
	if (existingUser) {
		return json<ActionData>({ errors: { email: 'A user already exists with this email' } }, { status: 400 })
	}

	const user = await createUser(email, password)

	return createUserSession({
		request,
		userId: user.id,
		remember: false,
		redirectTo,
	})
}

export const meta: MetaFunction = () => {
	return {
		title: 'Sign Up',
	}
}

export default () => {
	const [searchParams] = useSearchParams()

	const actionData = useActionData() as ActionData

	const emailRef = React.useRef<HTMLInputElement>(null)
	const passwordRef = React.useRef<HTMLInputElement>(null)

	React.useEffect(() => {
		if (actionData?.errors?.email) {
			emailRef.current?.focus()
		} else if (actionData?.errors?.password) {
			passwordRef.current?.focus()
		}
	}, [actionData])

	const redirectTo = searchParams.get('redirectTo') ?? '/'

	return (
		<Container>
			<Form method="post">
				<InputWrapper label="Email address" required>
					<TextInput ref={emailRef} name="email" type="email" defaultValue={actionData?.values?.email} />
				</InputWrapper>
				<InputWrapper label="Password" required>
					<TextInput ref={passwordRef} name="password" type="password" defaultValue={actionData?.values?.password} />
				</InputWrapper>
				<input name="redirectTo" type="hidden" defaultValue={redirectTo} />
				<Space h="xl" />
				<Button type="submit">Create Account</Button>
				<Space h="xl" />
				<Group spacing="xs">
					<Text size="sm">Already have an account?</Text>
					<Anchor
						size="sm"
						component={Link}
						to={{
							pathname: '/login',
							search: searchParams.toString(),
						}}
					>
						Log in
					</Anchor>
				</Group>
			</Form>
		</Container>
	)
}
