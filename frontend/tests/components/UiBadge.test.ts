// frontend/tests/components/UiBadge.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UiBadge from '~~/components/ui/UiBadge.vue'

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
