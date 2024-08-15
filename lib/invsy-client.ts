import Invsy from "invsy"
import { auth } from '@/auth';

const { user } = auth()

export const invsy = new Invsy(
	process.env.INVSY_API_KEY!,
	process.env.INVSY_PROJECT_ID!,
	user.id
)