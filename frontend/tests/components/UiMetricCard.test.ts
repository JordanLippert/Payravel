// frontend/tests/components/UiMetricCard.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UiMetricCard from '~~/components/ui/UiMetricCard.vue'

describe('UiMetricCard', () => {
  it('renders label', () => {
    const w = mount(UiMetricCard, { props: { label: 'Total', value: 3408, prefix: '€ ' } })
    expect(w.text()).toContain('Total')
  })

  it('renders sub text when provided', () => {
    const w = mount(UiMetricCard, { props: { label: 'L', value: 1, sub: '5 pendentes' } })
    expect(w.text()).toContain('5 pendentes')
  })

  it('renders accent strip when accent=true', () => {
    const w = mount(UiMetricCard, { props: { label: 'L', value: 1, accent: true } })
    expect(w.find('[style*="red-500"]').exists()).toBe(true)
  })
})
