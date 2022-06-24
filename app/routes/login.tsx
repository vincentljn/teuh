import type { ActionFunction, LoaderFunction, MetaFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react'
import * as React from 'react'
import { Anchor, Button, Checkbox, Container, Group, InputWrapper, Space, Text, TextInput } from '@mantine/core'

import { createUserSession, getUserId } from '~/session.server'
import { verifyLogin } from '~/models/user.server'
import { safeRedirect, validateEmail } from '~/utils'

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request)
	if (userId) {
		return redirect('/')
	}
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
	const redirectTo = safeRedirect(formData.get('redirectTo'), '/simulations')
	const remember = formData.get('remember')

	if (!validateEmail(email)) {
		return json<ActionData>({ errors: { email: 'Email is invalid' } }, { status: 400 })
	}

	if (typeof password !== 'string' || password.length === 0) {
		return json<ActionData>({ errors: { password: 'Password is required' } }, { status: 400 })
	}

	const user = await verifyLogin(email, password)

	if (!user) {
		return json<ActionData>({ errors: { email: 'Invalid email or password' } }, { status: 400 })
	}

	return createUserSession({
		request,
		userId: user.id,
		remember: remember === 'on',
		redirectTo,
	})
}

export const meta: MetaFunction = () => {
	return {
		title: 'Login',
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
				<Button type="submit">Log in</Button>
				<Space h="xl" />
				<Checkbox id="remember" name="remember" label="Remember me" />
				<Space h="xl" />
				<Group spacing="xs">
					<Text size="sm">Don't have an account?</Text>
					<Anchor
						size="sm"
						component={Link}
						to={{
							pathname: '/join',
							search: searchParams.toString(),
						}}
					>
						Sign up
					</Anchor>
				</Group>
			</Form>
		</Container>
	)
}
