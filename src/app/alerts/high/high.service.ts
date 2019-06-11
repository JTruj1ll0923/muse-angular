import { Injectable } from '@angular/core'
import { AbstractControl, Validators } from '@angular/forms'
import { Subscription } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class HighService {
  constructor() {}

  private subManager: Subscription

  private validationMessages = {
    required: 'This field is required.',
    email: 'Please enter a valid email.',
    minlength: 'Please enter valid information.'
  }

  setSubscription(control: AbstractControl, message: { str: string }): () => void {
    this.subManager = control.valueChanges.subscribe(() => {
      this.setMessage(control, message)

    })

    return function destroySub() {
      this.subManager.unsubscribe()
    }
  }

  setValidation(summaryArray: Array<any>): void {
    this.subManager = summaryArray[0].valueChanges.subscribe(value => {
      this.validationChanger(summaryArray, value)
      summaryArray[1].updateValueAndValidity()
    })
  }

  validationChanger(summaryArray: Array<any>, value) {
    if (value === 'Other' ) {
      summaryArray[1].setValidators(Validators.required)
    } else {
      summaryArray[1].clearValidators()
    }
  }

  removeSubscription(control: AbstractControl): void {
    this.subManager = control.valueChanges.subscribe()
  }

  private setMessage(control: AbstractControl, message: { str: string }): void {
    message.str = ''
    if ((control.touched || control.dirty) && control.errors) {
      message.str = Object.keys(control.errors)
        .map(key => (message.str += this.validationMessages[key]))
        .join(' ')
    }
  }
}
