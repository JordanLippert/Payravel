// frontend/tests/components/UiBadge.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import UiBadge from '~~/components/ui/UiBadge.vue'

vi.mock('~/composables/useT', () => ({
  useT: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'shared.status.pending':  'Pendente',
        'shared.status.approved': 'Aprovado',
        'shared.status.rejected': 'Rejeitado',
        'shared.status.expired':  'Expirado',
      }
      return map[key] ?? key
    },
  }),
}))

describe('UiBadge', () => {
  it('renders default label for pending status', () => {
    const w = mount(UiBadge, { props: { status: 'pending' } })
    expect(w.text()).toContain('Pendente')
  })

  it('renders slot content over default label', () => {
    const w = mount(UiBadge, { props: { status: 'approved' }, slots: { default: 'ao vivo ✓' } })
    expect(w.text()).toContain('ao vivo ✓')
  })

  it('renders dot by default', () => {
    const w = mount(UiBadge, { props: { status: 'rejected' } })
    expect(w.find('.pv-badge-dot').exists()).toBe(true)
  })

  it('hides dot when dot=false', () => {
    const w = mount(UiBadge, { props: { status: 'approved', dot: false } })
    expect(w.find('.pv-badge-dot').exists()).toBe(false)
  })
})
