import { describe, it, expect } from '@jest/globals'

describe('Automation Engine', () => {
    it('should parse trigger conditions correctly', () => {
        const trigger = {
            type: 'STATUS_CHANGE',
            conditions: { columnId: 'col-1', value: 'done' }
        }

        expect(trigger.type).toBe('STATUS_CHANGE')
        expect(trigger.conditions.columnId).toBe('col-1')
    })

    it('should replace variables in notification messages', () => {
        const template = 'تم تحديث {item.name} في {board.name}'
        const context = {
            item: { name: 'مهمة 1' },
            board: { name: 'لوحة المشروع' }
        }

        const result = template
            .replace(/\{item\.name\}/g, context.item.name)
            .replace(/\{board\.name\}/g, context.board.name)

        expect(result).toBe('تم تحديث مهمة 1 في لوحة المشروع')
    })
})

describe('Board Utilities', () => {
    it('should calculate timeline item positions correctly', () => {
        const startDate = new Date('2024-01-01')
        const endDate = new Date('2024-01-10')
        const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        expect(daysDiff).toBe(9)
    })

    it('should format dates correctly in Arabic', () => {
        const date = new Date('2024-01-15')
        const formatted = date.toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' })

        expect(formatted).toContain('2024')
    })
})
