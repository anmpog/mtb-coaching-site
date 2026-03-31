import { actions, isInputError } from 'astro:actions'

export default function initFormHandler(form: HTMLFormElement) {
  const formAction = form.dataset.action
  const formFieldsArr = Array.from(
    form.querySelectorAll('.form-control:not([data-optional])'),
  )

  const formFieldMap = new Map(
    formFieldsArr.map((formField) => {
      const inputElem = formField.querySelector('input, textarea') as
        | HTMLInputElement
        | HTMLTextAreaElement
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

  // Listener to reset server-side error visibility on input change
  formFieldMap.forEach((formField) => {
    const input = formField.inputElem
    const errorElem = formField.errorElem

    input.addEventListener('input', () => {
      errorElem.textContent = errorElem.dataset.defaultErrorMessage || ''
      // errorElem.classList.remove('visible')
    })
  })

  // console.log('Form inputs: ', formInputs)

  // Form submission listener/handler with Astro action
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(form)
    const { error } = await actions[formAction](formData)

    // Handle validation error from action/server
    if (isInputError(error)) {
      Object.entries(error.fields).forEach(([fieldName, messages]) => {
        const errorElemToUpdate = formFieldMap.get(fieldName).errorElem
        errorElemToUpdate.textContent = messages[0]
        errorElemToUpdate?.classList.add('visible')
      })
    }
  })
}

document
  .querySelectorAll<HTMLFormElement>('[data-action]')
  .forEach((form) => initFormHandler(form))
