import { z } from 'zod'
import * as z4 from 'zod/v4/core'
import contactFormSchema from '../schemas/contactForm'
import signUpFormSchema from '../schemas/signUpForm'

// Types
const schemaMap = {
  'contact-form': contactFormSchema,
  'signup-form': signUpFormSchema,
}

type SchemaKey = keyof typeof schemaMap
type FormField = {
  inputElem: HTMLInputElement | HTMLTextAreaElement
  errorElem: HTMLSpanElement
}

async function delay<T>(ms: number, fn: any): Promise<T> {
  return new Promise(() => {
    setTimeout(() => {
      fn()
    }, ms)
  })
}

// Utility function for runtime check
function isSchemaKey(key: string): key is SchemaKey {
  return key in schemaMap
}

// MAIN FUNCTION
export default function initFormHandler<Schema extends z.ZodObject>(
  form: HTMLFormElement,
  validationSchema: Schema,
): void {
  // Map structure for efficient lookups
  const formFieldMap = new Map<string, FormField>()

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

  async function setFormErrorState(errorMessage: string): Promise<void> {
    submitButton.disabled = false
    submitButton.dataset.state = 'error'
    submitButton.setAttribute('aria-busy', 'false')
    submitButton.setAttribute('aria-disabled', 'false')
    formStatus.textContent = `Submission error: ${errorMessage}`
    submitButtonErrorTextElem.textContent = `Submission error: ${errorMessage}`

    await delay(5000, () => {
      setFormDefaultState()
    })
  }

  function setFormSubmittingState(): void {
    submitButton.disabled = true
    submitButton.dataset.state = 'loading'
    submitButton.setAttribute('aria-busy', 'true')
    submitButton.setAttribute('aria-disabled', 'true')
    formStatus.textContent = 'Submitting form'
  }

  async function setFormSuccessState(): Promise<void> {
    submitButton.dataset.state = 'success'
    submitButton.setAttribute('aria-busy', 'false')
    submitButton.setAttribute('aria-disabled', 'false')
    formStatus.textContent = 'Form submitted successfull!'

    await delay(5000, () => {
      setFormDefaultState()
      resetForm()
    })
  }

  function setFormDefaultState(): void {
    submitButton.dataset.state = 'idle'
    submitButtonErrorTextElem.textContent = submitButtonErrorTextElem.dataset
      .defaultErrorMessage as string
    formStatus.textContent = formStatus.dataset.defaultStatusText as string
  }

  function resetForm(): void {
    form.reset()
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
      // Resetting errors, aria-invalid
      setErrorElemDefaultState(errorElem)
      setInputElemDefaultState(inputElem)
    })
  })

  // Form submission listener + handler
  form.addEventListener('submit', async (event) => {
    try {
      event.preventDefault()
      const formData = new FormData(form)

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
        let firstInvalidField = null

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
        setFormSubmittingState()

        // Fetch to home route per Netlify forms documentation
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Request failed with code ${response.status}`)
        }

        setFormSuccessState()
      }
    } catch (error) {
      if (error instanceof Error) {
        // eslint-disable-next-line no-console
        console.error('Error with form submission: ', error.message)
        setFormErrorState(error.message)
      } else {
        // eslint-disable-next-line no-console
        console.error('Unexpected error with form submission')
        setFormErrorState('Unexpected error')
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
