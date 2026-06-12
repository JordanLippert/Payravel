export { signin } from './signin'
export { signup } from './signup'
export { logout } from './logout'
export { forgotPassword } from './forgotPassword'

import { signin } from './signin'
import { signup } from './signup'
import { logout } from './logout'
import { forgotPassword } from './forgotPassword'

export const authService = { signin, signup, logout, forgotPassword }
