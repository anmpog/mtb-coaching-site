import { z } from 'zod'
import * as z4 from 'zod/v4/core'
import contactFormSchema from '../schemas/contactForm'
import signUpFormSchema from '../schemas/signUpForm'

// Map for lookups
const schemaMap = {
  'contact-form': contactFormSchema,
  'signup-form': signUpFormSchema,
}

// Types
type SchemaKey = keyof typeof schemaMap
type FormField = {
  inputElem: HTMLInputElement | HTMLTextAreaElement
  errorElem: HTMLSpanElement
}
type SubmitState = 'idle' | 'loading' | 'success' | 'error'

// Utility function for runtime check
function isSchemaKey(key: string): key is SchemaKey {
  return key in schemaMap
}

// MAIN
export default function initFormHandler<Schema extends z.ZodObject>(
  form: HTMLFormElement,
  validationSchema: Schema,
): void {
  // Map structure for efficient lookups
  const formFieldMap = new Map<string, FormField>()

  // Variable for tracking timeout IDs
  let pendingStateTimeout: ReturnType<typeof setTimeout> | null = null

  function setFormState(state: SubmitState, errorMsg?: string) {
    submitButton.dataset.state = state

    switch (state) {
      case 'idle':
        submitButton.disabled = false
        form.setAttribute('aria-busy', 'false')
        submitButtonErrorTextElem.textContent = submitButtonErrorTextElem
          .dataset.defaultErrorMessage as string
        formStatus.textContent = formStatus.dataset.defaultStatusText as string
        break
      case 'loading':
        submitButton.disabled = true
        form.setAttribute('aria-busy', 'true')
        formStatus.textContent = 'Submitting form'
        break
      case 'success':
        form.setAttribute('aria-busy', 'false')
        formStatus.textContent = 'Form submitted successfully!'
        resetForm()
        scheduledStateChange('idle', 5000)
        break
      case 'error':
        submitButton.disabled = false
        form.setAttribute('aria-busy', 'false')
        formStatus.textContent = `Submission error: ${errorMsg}`
        submitButtonErrorTextElem.textContent = `Submission error: ${errorMsg}`
        break
    }
  }

  // Utility Functions
  function setFieldErrorState(
    formField: FormField,
    validationError: string,
  ): void {
    formField.errorElem.textContent = validationError
    formField.errorElem.classList.add('visible')
    formField.inputElem.setAttribute('aria-invalid', 'true')
  }

  function resetFieldErrorState(formField: FormField): void {
    const { errorElem, inputElem } = formField
    errorElem.textContent =
      errorElem.dataset.defaultErrorMessage || 'Unknown Validation Error'
    errorElem.classList.remove('visible')
    inputElem.setAttribute('aria-invalid', 'false')
  }

  function setErrorElemDefaultState(errorElem: HTMLSpanElement): void {
    errorElem.textContent = errorElem.dataset.defaultErrorMessage || ''
    errorElem.classList.remove('visible')
  }

  function setInputElemDefaultState(
    inputElem: HTMLInputElement | HTMLTextAreaElement,
  ): void {
    inputElem.setAttribute('aria-invalid', 'false')
  }

  function resetForm(): void {
    form.reset()
  }

  function clearPendingStateChange(): void {
    if (pendingStateTimeout) {
      clearTimeout(pendingStateTimeout)
      pendingStateTimeout = null
    }
  }

  function scheduledStateChange(state: SubmitState, ms: number): void {
    clearPendingStateChange()

    pendingStateTimeout = setTimeout(() => {
      setFormState(state)
      pendingStateTimeout = null
    }, ms)
  }

  form
    .querySelectorAll('.form-control:not([data-optional])')
    .forEach((formField) => {
      const inputElem = formField.querySelector('input, textarea') as
        | HTMLInputElement
        | HTMLTextAreaElement

      const errorElem = formField.querySelector(
        '[id$="-error"]',
      ) as HTMLSpanElement

      formFieldMap.set(inputElem.name, { inputElem, errorElem })
    })

  // UI elements to update
  const submitButton = form.querySelector('[type=submit]') as HTMLButtonElement
  const formStatus = form.querySelector('#form-status') as HTMLSpanElement
  const submitButtonErrorTextElem = submitButton.querySelector(
    '.error-text',
  ) as HTMLSpanElement

  // Listener to reset error visibility on input event
  formFieldMap.forEach(({ inputElem, errorElem }) => {
    inputElem.addEventListener('input', () => {
      setErrorElemDefaultState(errorElem)
      setInputElemDefaultState(inputElem)

      clearPendingStateChange()
      setFormState('idle')
    })
  })

  // Form submission listener + handler
  form.addEventListener('submit', async (event) => {
    try {
      event.preventDefault()
      const targetAsForm = event.currentTarget
      // console.log('Target as form: ', targetAsForm)
      const formData = new FormData(targetAsForm)
      const formDataFormatted = new URLSearchParams(formData).toString()
      // console.log('formDataFormatted: ', formDataFormatted)

      // Reset errors on submit to make sure no stale errors
      formFieldMap.forEach((formField) => {
        resetFieldErrorState(formField)
      })

      // Validation success/error state
      const validationResult = z4.safeParse(
        validationSchema,
        Object.fromEntries(formData),
      )

      // If zod error then update text of relevant UI
      if (!validationResult.success) {
        const { fieldErrors } = z.flattenError(validationResult.error)
        let firstInvalidField: FormField['inputElem'] | null = null

        // Handle validation error from action/server
        for (const [field, messages] of Object.entries(fieldErrors)) {
          const fieldWithError = formFieldMap.get(field)

          if (!fieldWithError) continue

          if (!firstInvalidField) {
            firstInvalidField = fieldWithError.inputElem
          }

          setFieldErrorState(
            fieldWithError,
            messages?.[0] || 'Unknown validation error',
          )
        }

        firstInvalidField?.focus()
      } else {
        setFormState('loading')

        // Fetch to home route per Netlify forms documentation
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formDataFormatted,
        })

        if (!response.ok) {
          throw new Error(`Request failed with code ${response.status}`)
        }

        setFormState('success')
      }
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('Error with form submission: ', error.message)
        setFormState('error', error.message)
        scheduledStateChange('idle', 5000)
      } else {
        // eslint-disable-next-line no-console
        console.error('Unexpected error with form submission')
        setFormState('error', 'Unexpected error')
        scheduledStateChange('idle', 5000)
      }
    }
  })
}

document.querySelectorAll<HTMLFormElement>('[data-schema]').forEach((form) => {
  const schemaKey = form?.dataset?.schema

  if (!schemaKey || !isSchemaKey(schemaKey)) {
    throw new Error('Missing or invalid schema')
  }

  initFormHandler(form, schemaMap[schemaKey])
})
