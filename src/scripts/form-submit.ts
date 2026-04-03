import { actions, isActionError, isInputError } from 'astro:actions'

export default function initFormHandler(form: HTMLFormElement) {
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
    const formAction = form.dataset.action as keyof typeof actions
    const formData = new FormData(form)
    const { data, error } = await actions[formAction](formData)

    // Handle validation error from action/server
    if (isInputError(error)) {
      Object.entries(error.fields).forEach(([fieldName, messages]) => {
        const errorElemToUpdate = formFieldMap.get(fieldName)
        if (!errorElemToUpdate) return
        errorElemToUpdate.errorElem.textContent = messages[0]
        errorElemToUpdate.errorElem.classList.add('visible')
      })

      // early exit
      return
    }

    if (isActionError(error)) {
      console.error(error.message, error.code)

      // early exit
      return
    }

    if (data) {
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

      return data
    }
  })
}

document
  .querySelectorAll<HTMLFormElement>('[data-action]')
  .forEach((form) => initFormHandler(form))
