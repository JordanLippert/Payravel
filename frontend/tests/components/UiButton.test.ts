// frontend/tests/components/UiButton.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UiButton from '~~/components/ui/UiButton.vue'

describe('UiButton', () => {
  it('renders slot content', () => {
    const w = mount(UiButton, { slots: { default: 'Enviar' } })
    expect(w.text()).toBe('Enviar')
  })

  it('emits click when not disabled', async () => {
    const w = mount(UiButton, { props: { variant: 'primary' }, slots: { default: 'OK' } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeTruthy()
  })

  it('does not emit click when disabled', async () => {
    const w = mount(UiButton, { props: { disabled: true }, slots: { default: 'OK' } })
    await w.trigger('click')
    expect(w.emitted('click')).toBeFalsy()
  })

  it('applies fullWidth class', () => {
    const w = mount(UiButton, { props: { fullWidth: true }, slots: { default: 'X' } })
    expect(w.find('button').classes()).toContain('w-full')
  })
})
