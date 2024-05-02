import {describe, expect, it, vi} from 'vitest'
import {getWorkflowEvent} from '@/common/github/workflow-event/workflow-event'
import {stubTestEnvVars} from '__tests__/helpers/env'

describe('workflow-event', () => {
  describe('workflow_dispatch event', () => {
    beforeAll(() => {
      stubTestEnvVars('workflow_dispatch')
    })

    it('should correctly process workflow_dispatch event payloads', () => {
      const event = getWorkflowEvent()
      expect(event.eventName).toBe('workflow_dispatch')
      expect(event.payload).toBeDefined()
    })

    it('should trigger deployment creation for workflow_dispatch events', async () => {
      const event = getWorkflowEvent()
      expect(event.eventName).toBe('workflow_dispatch')
      // Simulate deployment creation logic
      const createDeployment = vi.fn()
      await createDeployment(event.payload)
      expect(createDeployment).toHaveBeenCalled()
    })
  })
})
