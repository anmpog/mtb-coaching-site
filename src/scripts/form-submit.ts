import { z } from 'zod'
import * as z4 from 'zod/v4/core'
import contactFormSchema from '../schemas/contactForm'
import signUpFormSchema from '../schemas/signUpForm'

const schemaMap = {
  'contact-form': contactFormSchema,
  'signup-form': signUpFormSchema,
}

export default function initFormHandler<T extends z4.$ZodObject>(
  form: HTMLFormElement,
  validationSchema: T,
) {
  // Get form fields in array structure so it's easier iterate over them
  const formFieldsArr = Array.from(
    form.querySelectorAll('.form-control:not([data-optional])'),
  )

  // Map structure so that iteration isn't necessary for updating individual
  // fields
  const formFieldMap = new Map(
    formFieldsArr.map((formField) => {
      const inputElem = formField.querySelector('input, textarea') as
        | HTMLInputElement
        | HTMLTextAreaElement

      // Error field id attributes end with '-error' by convention
      const errorElem = formField.querySelector(
        'p[id$="-error"]',
      ) as HTMLParagraphElement

      return [
        inputElem.name,
        {
          inputElem: inputElem,
          errorElem: errorElem,
        },
      ]
    }),
  )

  // UI elements to update
  const submitButton = form.querySelector('[type=submit]') as HTMLButtonElement
  const submitButtonText = form.querySelector(
    '[type="submit"] span',
  ) as HTMLSpanElement
  const submitButtonIcon = form.querySelector(
    '[type="submit"] svg',
  ) as HTMLElement

  // Listener to reset server-side error visibility on input event
  formFieldMap.forEach((formField) => {
    const input = formField.inputElem
    const errorElem = formField.errorElem

    input.addEventListener('input', () => {
      errorElem.textContent = errorElem.dataset.defaultErrorMessage || ''
      errorElem.classList.remove('visible')
    })
  })

  // Form submission listener + handler
  form.addEventListener('submit', async (event) => {
    try {
      event.preventDefault()
      const formData = Object.fromEntries(new FormData(form))

      // Make sure error text is in original state before any changes
      formFieldMap.forEach(({ errorElem }) => {
        errorElem.textContent = errorElem.dataset.defaultErrorMessage || ''
        errorElem.classList.remove('visible')
      })

      // Validation success/error state
      const validationResult = z4.safeParse(validationSchema, formData)

      // If zod error then update text of relevant UI
      if (!validationResult.success) {
        const { fieldErrors } = z.flattenError(validationResult.error)

        // Handle validation error from action/server
        for (const [field, messages] of Object.entries(fieldErrors)) {
          const errorElemToUpdate = formFieldMap.get(field)

          if (!errorElemToUpdate) continue

          errorElemToUpdate.errorElem.textContent = messages?.[0] || ''
          errorElemToUpdate.errorElem.classList.add('visible')
        }
      } else {
        // Fetch to home route per Netlify forms documentation
        const response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(formData).toString(),
        })

        if (response.ok) {
          submitButtonText.innerHTML = 'Submitted'
          submitButton.toggleAttribute('disabled')
          submitButtonIcon.classList.add('visible')
        } else if (!response.ok) {
          // To do: expand error styling/logic
          submitButtonText.innerHTML = 'Error!'
          submitButton.toggleAttribute('disabled')
        }
      }
    } catch (error) {
      console.error('Error with form submission: ', error)
    }
  })
}

document.querySelectorAll<HTMLFormElement>('[data-schema]').forEach((form) => {
  const schemaKey = form?.dataset?.schema

  if (!schemaKey || !(schemaKey in schemaMap)) {
    throw new Error('Missing or invalid schema')
  }

  initFormHandler(form, schemaMap[schemaKey])
})
