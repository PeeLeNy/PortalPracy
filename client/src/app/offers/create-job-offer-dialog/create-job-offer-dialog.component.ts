import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../_services/account.service';

@Component({
  selector: 'app-create-job-offer-dialog',
  templateUrl: './create-job-offer-dialog.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class CreateJobOfferDialogComponent {
  jobOfferForm: FormGroup;
  private accountService = inject(AccountService);

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CreateJobOfferDialogComponent>
  ) {
    this.jobOfferForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      salaryFrom: [null, [Validators.required, Validators.min(0)]],
      salaryTo: [null, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.jobOfferForm.valid) {
      const jobOfferData = this.jobOfferForm.value;
      jobOfferData.userEmail = this.accountService.currentUser()?.email;
      this.dialogRef.close(jobOfferData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}