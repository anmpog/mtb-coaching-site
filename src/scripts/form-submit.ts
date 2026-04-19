import { z } from 'zod'
import signUpFormSchema from '../schemas/signUpForm'

export default function initFormHandler(
  form: HTMLFormElement,
  validationSchema,
) {
  // Get form fields in array structure so it's easier iterate over them
  const formFieldsArr = Array.from(
    form.querySelectorAll('.form-control:not([data-optional])'),
  )

  console.log('Form: ', form)

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
        inputElem.id,
        {
          inputElem: inputElem,
          errorElem: errorElem,
        },
      ]
    }),
  )

  // Listener to reset server-side error visibility on input event
  formFieldMap.forEach((formField) => {
    const input = formField.inputElem
    const errorElem = formField.errorElem

    input.addEventListener('input', () => {
      errorElem.textContent = errorElem.dataset.defaultErrorMessage || ''
      errorElem.classList.remove('visible')
    })
  })

  // Form submission listener/handler with Astro action
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = Object.fromEntries(new FormData(form))
    console.log('Form data: ', formData)
    const rawForm = new FormData(form)
    console.log('raw form: ', rawForm)

    // Validation success/error state
    const { success: zodSuccess, error: zodError } =
      validationSchema.safeParse(formData)

    // If error then update text of relevant error element
    if (zodError instanceof z.ZodError) {
      // console.log('unflattened error: ', error)
      const { fieldErrors } = z.flattenError(zodError)
      // console.log('Flattened error: ', fieldErrors)

      // Handle validation error from action/server
      for (const [field, messages] of Object.entries(fieldErrors)) {
        console.log('field, messages: ', field, messages)
        const errorElemToUpdate = formFieldMap.get(field)
        // console.log('Error field that will update: ', errorElemToUpdate)

        // early exit
        if (!errorElemToUpdate) return

        errorElemToUpdate.errorElem.textContent = messages[0]
        errorElemToUpdate.errorElem.classList.add('visible')
      }

      return
    }

    // if success then submit with AJAX to Netlify
    if (zodSuccess) {
      // Fetch to home route per Netlify
      const formAsUrl = new URLSearchParams(rawForm).toString()
      console.log(formAsUrl)

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(rawForm).toString(),
      })
        .then((res) => {
          const submitButton = form.querySelector(
            '[type=submit]',
          ) as HTMLButtonElement
          const submitButtonText = form.querySelector(
            '[type="submit"] span',
          ) as HTMLSpanElement
          const submitButtonIcon = form.querySelector(
            '[type="submit"] svg',
          ) as HTMLElement

          submitButtonText.innerHTML = 'Submitted'
          submitButton.toggleAttribute('disabled')
          submitButtonIcon.classList.add('visible')
        })
        .catch((error) => {
          console.log('Error with form submission: ', error)
        })
    }
  })
}

document
  .querySelectorAll<HTMLFormElement>('form')
  .forEach((form) => initFormHandler(form, signUpFormSchema))
