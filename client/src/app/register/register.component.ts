import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, input, output, Output   } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private accountService = inject(AccountService);
  cancelRegister = output<boolean>();
  model: any = {studentStatus: false};

  register() {
    this.accountService.register(this.model).subscribe({
      next: respone => {
        console.log(respone);
        this.cancel();
      },
      error: error  => console.log(error)
    });
  }
  cancel(){
    this.cancelRegister.emit(false);
  }
  toggleStudentStatus(): void {
    this.model.studentStatus = !this.model.studentStatus;
  }
}