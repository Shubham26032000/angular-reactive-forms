import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, of } from 'rxjs';

//instead of storing in oninit it reactive form give us flexibility
let initialEmailValue = '';
const savedForm = window.localStorage.getItem('saved-login-form');

if(savedForm){
  const loadedForm = JSON.parse(savedForm);
  initialEmailValue = loadedForm.email;
}

function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }

  return { doesNotContainsQuestionMark: true };
}

function emailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }
  return of({ notUnique: true });
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  myForm = new FormGroup({
    email: new FormControl(initialEmailValue, {
      validators: [Validators.email, Validators.required],
      asyncValidators: [emailIsUnique],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        mustContainQuestionMark,
      ],
    }),
  });

  get emailIsValid() {
    return (
      this.myForm.controls.email.touched &&
      this.myForm.controls.email.dirty &&
      this.myForm.controls.email.invalid
    );
  }

  get passwordIsValid() {
    return (
      this.myForm.controls.password.touched &&
      this.myForm.controls.password.dirty &&
      this.myForm.controls.password.invalid
    );
  }
  ngOnInit(): void {
    // const savedForm = window.localStorage.getItem('saved-login-form');
    // if(savedForm){
    //   const loadedForm = JSON.parse(savedForm);
    //   this.myForm.patchValue({
    //     email:loadedForm.email,
    //   })
    // }
    const subscription = this.myForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: (value) => {
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({ email: value.email })
          );
        },
      });

    this.destroyRef.onDestroy(()=>subscription.unsubscribe())
  }

  onSubmit() {
    console.log(this.myForm);
    const enteredEmail = this.myForm.value.email;
    const enteredPassword = this.myForm.value.password;
  }
}
