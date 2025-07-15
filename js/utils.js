var utils = {
  init: () => {
    utils._datePickerMask()
    utils._flatpickr()
    utils._watchFlatpickrCalendar()
    utils._validateForm()
  },
  _datePickerMask: () => {
    Inputmask('99/99/9999').mask('#dob') //applies input mask to DOB field (MM/DD/YYYY)
  },
  _calendarIconBtn: (instance) => {
    $('.calendar-icon').on('click', function () {
      instance.open() //open calendar manually
      console.log('clicking calendar')
    })

    $('#dob').on('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault() //prevent form submit

        instance.open() //open calendar manually
        console.log('clicking calendar')
      }
    })
  },
  _flatpickr: () => {
    //Flatpickr date picker
    flatpickr('#dob', {
      dateFormat: 'm/d/Y',
      allowInput: true, //allows users to type date manually
      disableMobile: true, //forces desktop version of Flatpickr on mobile devices
      clickOpens: false, //prevents the calendar from opening automatically

      onReady: function (selectedDates, dateStr, instance) {
        instance.calendarContainer.setAttribute('tabindex', '0')

        //create footer containter
        const footer = document.createElement('div')
        footer.className = 'flatpickr-footer'
        footer.innerHTML = `
                    <button type="button" class="flatpickr-clear" tabindex="0">Clear</button>
                    <div class="btns-container">
                        <button type="button" class="flatpickr-cancel" tabindex="0">Cancel</button>
                        <button type="button" class="flatpickr-ok" tabindex="0">OK</button>
                    </div>
                `

        //append footer to calendar
        instance.calendarContainer.appendChild(footer)

        //button event handlers
        footer
          .querySelector('.flatpickr-clear')
          .addEventListener('click', () => {
            instance.clear()
            instance.close()
          })

        footer
          .querySelector('.flatpickr-cancel')
          .addEventListener('click', () => {
            instance.close()
          })

        footer.querySelector('.flatpickr-ok').addEventListener('click', () => {
          instance.close()
        })

        //make calendar elements keyboard accessible
        utils._makeCalendarElmentsFocusable(instance)

        //calendar icon logic (event handlers)
        utils._calendarIconBtn(instance)
      },

      onOpen: function (selectedDates, dateStr, instance) {
        //dealy to let DOM render
        setTimeout(() => {
          utils._makeCalendarElmentsFocusable(instance) //make calendar elements keyboard accessible

          //foucs to the first element of the Calendar
          const prevMonthBtn = instance.calendarContainer.querySelector(
            ".flatpickr-prev-month[tabindex='0']"
          )
          if (prevMonthBtn) prevMonthBtn.focus()
        }, 10)
      },
      onMonthChange: function (selectedDates, dateStr, instance) {
        //DOM is re-rendered when switching months
        setTimeout(() => {
          utils._makeCalendarElmentsFocusable(instance) //make calendar elements keyboard accessible
        }, 10)
      },
    })
  },
  _makeCalendarElmentsFocusable: (instance) => {
    const dayElements =
      instance.calendarContainer.querySelectorAll('.flatpickr-day')
    dayElements.forEach((el) => el.setAttribute('tabindex', '0'))

    const otherSelectors = [
      '.flatpickr-days',
      '.flatpickr-prev-month',
      '.flatpickr-next-month',
      '.flatpickr-monthDropdown-months',
      '.numInput.cur-year',
    ]

    otherSelectors.forEach((selector) => {
      const calendarElement = instance.calendarContainer.querySelector(selector)
      if (calendarElement) calendarElement.setAttribute('tabindex', '0')
    })
  },
  _watchFlatpickrCalendar: () => {
    const calendarEl = document.querySelector('.flatpickr-calendar')

    if (!calendarEl) return

    //observe changes to calendar's class to detect open/close state
    const observer = new MutationObserver(() => {
      if (calendarEl.classList.contains('open')) {
        document.body.style.overflow = 'hidden'
      } else {
        //delay removing overflow:hidden to wait for close animation to finish
        setTimeout(() => {
          if (!calendarEl.classList.contains('open')) {
            document.body.style.overflow = ''
          }
        }, 250) //adjust this delay to match Flatpickr's closing animation
      }
    })

    //start observing only class attribute changes
    observer.observe(calendarEl, {
      attributes: true,
      attributeFilter: ['class'],
    })
  },
  _validateForm: () => {
    // form validation

    jQuery.validator.addMethod(
      'emailFormat',
      function (value) {
        let emailRegex =
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (emailRegex.test(value)) {
          return true
        } else {
          return false
        }
      },
      'Invalid email address'
    )

    jQuery.validator.addMethod(
      'validateAge',
      function (value) {
        if (!value) return false

        const birthDate = new Date(value)
        if (birthDate.toString() === 'Invalid Date') return false

        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        const d = today.getDate() - birthDate.getDate()

        //adjust if birthday hasn't occurred yet this year
        if (m < 0 || (m === 0 && d < 0)) {
          age--
        }

        return age >= 18
      },
      'Must be 18 years of age or older'
    )

    jQuery.validator.addMethod(
      'zipcode',
      function (value, element) {
        return this.optional(element) || /^\d{5}$/.test(value)
      },
      'Zip needs to be 5 digits'
    )

    $('#sweepsForm').validate({
      rules: {
        eventDay: 'required',
        firstName: 'required',
        lastName: 'required',
        email: {
          required: true,
          emailFormat: true,
        },
        dob: {
          required: true,
          validateAge: true,
        },
        street: 'required',
        city: 'required',
        state: 'required',
        zipCode: {
          required: true,
          zipcode: true,
        },
        optInRules: 'required',
      },
      messages: {
        eventDay: '*Choose a day is required',
        firstName: '*First name is required',
        lastName: '*Last name is required',
        email: {
          required: '*Email is required',
          email: 'Invalid email address',
        },
        dob: {
          required: '*Date of birth is required',
          validateAge: 'Must be 18 years of age or older',
        },
        street: '*Street address is required',
        city: '*City is required',
        state: '*State is required',
        zipCode: {
          required: '*Zip is required',
          zipcode: ' Invalid Zip Code',
        },
        optInRules: 'The opt-in required',
      },

      errorPlacement: function (error, element) {
        if (
          element.prop('type') === 'checkbox' &&
          element.prop('name') == 'optInRules'
        ) {
          error.insertAfter($('#checkboxCopy'))

          if (element.hasClass('error')) {
            element.next('label').addClass('error-label')
          }
        } else if (element.attr('type') == 'radio') {
          error.appendTo(element.closest('.event-choice-group'))
        } else {
          error.insertAfter(element)
        }
      },

      submitHandler: function (form) {
        $('.btn-submit').css('display', 'none')
        $('.submittingText').css('display', 'block')

        //get selected concert day based on which radio button is checked
        let eventDaySelected
        if ($('#eventSaturday').is(':checked')) {
          eventDaySelected = 'Saturday, August 30 (Tim McGraw)'
        } else {
          eventDaySelected =
            'Sunday, August 31 (Velocity Music Festival ft. Nickelback)'
        }

        //convert the DOB input (MM/DD/YYYY) to ISO 8601 format (YYYY/MM/DDT00:00:00Z).
        const rawDate = $('#dob').val()
        const [month, day, year] = rawDate.split('/')
        const isoDate = new Date(`${year}-${month}-${day}`).toISOString()

        const dataSubmission = {
          FirstName: $('#firstName').val(),
          LastName: $('#lastName').val(),
          Email: $('#email').val(),
          DateofBirth: isoDate,
          Address: $('#street').val(),
          City: $('#city').val(),
          State: $('#state').val(),
          ZipCode: $('#zipCode').val(),
          ConcertDate: eventDaySelected,
          OptInRules: $('#optInRules').is(':checked'),
          OptInEmail: $('#optInEmail').is(':checked'),
        }

        console.log(dataSubmission)
        window.location.href = 'ThankYou.html'

        //const emailAlreadyExist = 'RESPONSE_MESAJE';
        //const apiURL = 'YOUR_API_URL';

        /*$.ajax({
                   type: 'POST',
                   url: apiURL,
                   dataType: 'json',
                   contentType: "application/json; charset=utf-8",
                   data: JSON.stringify(dataSubmission),
                    success: function (result) {
                       console.log('Success: ', result);

                       if (result.message === emailAlreadyExist) {
                            $('body').css("overflow", "hidden");
                            $('.overlay-error-message').show();
                       } else {
                            window.location.href = '/ThankYou';
                       }
                    },
                   error: function (error) {
                        console.log('Error in Operation: ', error);
                        $('.btn-submit').css("display", "block");
                        $('.submittingText').css("display", "none");
                    }
                });*/
      },
    })
  },
  /*_recaptcha: async () => {
    // get recaptcha response
    const token = grecaptcha.getResponse()
    //console.log(token);

    // now verify token
    const verifyUrl = `recaptcha-api/verify`
    const verifyBody = {
      secret: '',
      token: token,
    }

    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyBody),
      }
      const response = await fetch(verifyUrl, options)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      // it's a success if we get to this point
      const res = await response.json()

      const verifyObj = JSON.parse(res.message)

      document.querySelector('#recaptcha-error').style.display = 'none' // hide error by default

      if (verifyObj.success) {
        // form can now be submitted
        $('#SubmitForm').prop('disabled', false)
      } else {
        // stay on this page, show error message that recaptcha fails
        document.querySelector('#recaptcha-error').style.display = 'block'
      }
    } catch (error) {
      console.error('Error: ', error.message)
    } finally {
    }
  },*/
}
