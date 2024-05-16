import { Component } from '@angular/core';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  monthlyPayment: number;

  constructor() {
    this.propertyPrice = 0;
    this.downPayment = 0;
    this.loanAmount = 0;
    this.interestRate = 0;
    this.loanTerm = 0;
    this.monthlyPayment = 0;
  }

  onCalculate(): void {
    // Éves kamatláb átváltása havi kamatlábbá
    const monthlyInterestRate = this.interestRate / 100 / 12;

    // A futamidő átváltása hónapok számába
    const numberOfPayments = this.loanTerm * 12;

    // A havi törlesztőrészlet kiszámítása annuitás képlet alapján
    this.monthlyPayment = this.loanAmount *
                          monthlyInterestRate /
                          (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
  }
}