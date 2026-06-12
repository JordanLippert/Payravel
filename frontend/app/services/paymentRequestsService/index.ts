export { list } from './list'
export { create } from './create'
export { show } from './show'
export { updateStatus } from './updateStatus'
export type { PaymentRequest } from './list'

import { list } from './list'
import { create } from './create'
import { show } from './show'
import { updateStatus } from './updateStatus'

export const paymentRequestsService = { list, create, show, updateStatus }
