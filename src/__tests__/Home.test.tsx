import { expect, test, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import HomePage from '../app/page'

describe('HomePage', () => {
    test('renders the main heading', () => {
        render(<HomePage />)
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('DHA')
        expect(screen.getByText('Premium Fittings & Tools')).toBeInTheDocument()
    })

    test('renders shop links', () => {
        render(<HomePage />)
        expect(screen.getByRole('link', { name: /shop retail/i })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /wholesale/i })).toBeInTheDocument()
    })
})
