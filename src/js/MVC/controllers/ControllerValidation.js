/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/MVC/controllers/ControllerValidation.js
 *
 */

export default class ControllerValidation {

  constructor(main) {
    this.main = main;

    this.firstError = null;

    // These fields must be valid before updating Quote or changing order
    this.deliveryFields = {
      deliveryFirstname: {
        field: jQuery('#input-firstname'),
        desc: 'Delivery First Name',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryLastname: {
        field: jQuery('#input-lastname'),
        desc: 'Delivery Last Name',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryAddress: {
        field: jQuery('#delivery-address'),
        desc: 'Delivery Address',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryStreet: {
        field: jQuery('#delivery-street-address'),
        desc: 'Delivery Street Address',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryCity: {
        field: jQuery('#delivery-city'),
        desc: 'Delivery Suburb',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryPostcode: {
        field: jQuery('#delivery-postcode'),
        desc: 'Delivery Postcode',
        requiredType: 'string',
        status: 'pristine'
      },
      deliveryPhone: {
        field: jQuery('#delivery-telephone'),
        desc: 'Delivery Phone',
        requiredType: 'string',
        status: 'pristine'
      }
    };
    // These fields must be valid only if CartCheckItOut.shippingAsBilling === 0
    // ie shipping and billing address are different

    this.billingFields = {
      billingFirstname: {
        field: jQuery('#input-billing-firstname'),
        desc: 'Billing First Name',
        requiredType: 'string',
        status: 'pristine'
      },
      billingLastname: {
        field: jQuery('#input-billing-lastname'),
        desc: 'Billing Last Name',
        requiredType: 'string',
        status: 'pristine'
      },
      billingAddress: {
        field: jQuery('#billing-address'),
        desc: 'Billing Address',
        requiredType: 'string',
        status: 'pristine'
      },
      billingStreet: {
        field: jQuery('#billing-street-address-ip'),
        desc: 'Billing Street Address',
        requiredType: 'string',
        status: 'pristine'
      },
      billingCity: {
        field: jQuery('#billing-city'),
        desc: 'Billing Suburb',
        requiredType: 'string',
        status: 'pristine'
      },
      billingPostcode: {
        field: jQuery('#billing-postcode'),
        desc: 'Billing Postcode',
        requiredType: 'string',
        status: 'pristine'
      },
      billingPhone: {
        field: jQuery('#billing-telephone'),
        desc: 'Billing Phone',
        requiredType: 'string',
        status: 'pristine'
      }
    }

    this.creditCardFields = {
      cc_number: {
        field: jQuery('#aligent_directpost_securepay_cc_number'),
        desc: 'Credit Card Number',
        requiredType: 'creditcard',
        status: 'pristine'
      },
      cc_cvv: {
        field: jQuery('#aligent_directpost_securepay_cc_cid'),
        desc: 'Credit CVV',
        requiredType: 'cvv',
        status: 'pristine'
      },
      cc_exp_month: {
        field: jQuery('#aligent_directpost_securepay_expiration'),
        desc: 'Credit Month',
        requiredType: 'month',
        status: 'pristine'
      },
      cc_exp_year: {
        field: jQuery('#aligent_directpost_securepay_expiration_yr'),
        desc: 'Credit Year',
        requiredType: 'month',
        status: 'pristine'
      }
    }
  }

  isString (value){
    if(jQuery.type(value) === "string" && value !== ''){
      return true;
    }else{
      return false;
    }
  }


  validate_CVV(cvv){
    if (jQuery.isNumeric(cvv)){
      if (cvv.length === 3){
        return true;
      }
    }
    return false;
  }

  validateExp (field){
    const exp = jQuery(this.creditCardFields[field].field).val();
    if (exp === ''){
      this.main.v.fieldReset (this.creditCardFields[field].field);
      this.creditCardFields[field].status = 'invalid';
    } else {
      this.main.v.fieldShowValid (this.creditCardFields[field].field);
      this.creditCardFields[field].status = 'valid';
    }
  }


  validateCreditCardField (field){
    const fieldVal = this.creditCardFields[field].field.val();
    const requiredType = this.creditCardFields[field].requiredType;
    if (requiredType === 'string'){
      if (this.isString(fieldVal)){
        this.main.v.fieldShowValid (this.creditCardFields[field].field);
        this.creditCardFields[field].status = 'valid';
      }else{
        this.main.v.fieldReset (this.creditCardFields[field].field);
        this.creditCardFields[field].status = 'invalid';
      }
    } else if (requiredType === 'creditcard'){
      this.creditCardFields[field].field.validateCreditCard(function(result) {
        if (result.valid){
          this.main.v.fieldShowValid (this.creditCardFields[field].field);
          this.creditCardFields[field].status = 'valid';
        }else{
          this.main.v.fieldReset (this.creditCardFields[field].field);
          this.creditCardFields[field].status = 'invalid';
        }
      }.bind(this));
    } else if (requiredType === 'cvv'){
      if (this.validate_CVV(this.creditCardFields[field].field.val())){
        this.main.v.fieldShowValid (this.creditCardFields[field].field);
        this.creditCardFields[field].status = 'valid';
      } else {
        this.main.v.fieldReset (this.creditCardFields[field].field);
        this.creditCardFields[field].status = 'invalid';
      }
    }
  }

  validateBillingField (field){
    const fieldVal = this.billingFields[field].field.val();
    const requiredType = this.billingFields[field].requiredType;
    if (requiredType === 'string'){
      if (this.isString(fieldVal)){
        this.main.v.fieldShowValid (this.billingFields[field].field);
        this.billingFields[field].status = 'valid';
      }else{
        this.main.v.fieldReset (this.billingFields[field].field);
        this.billingFields[field].status = 'invalid';
      }
    }
  }

  validateField (field){
    const fieldVal = this.deliveryFields[field].field.val();
    const requiredType = this.deliveryFields[field].requiredType;
    if (requiredType === 'string'){
      if (this.isString(fieldVal)){
        this.main.v.fieldShowValid (this.deliveryFields[field].field);
        this.deliveryFields[field].status = 'valid';
      }else{
        this.main.v.fieldReset (this.deliveryFields[field].field);
        this.deliveryFields[field].status = 'invalid';
      }
    }
  }

  validate(){
    this.main.v.feedback('<strong>Validating....</strong>', 'blue', false);
    this.main.v.feedback(Date.now(), false, true);
    let isValid = true;

    Object.keys(this.deliveryFields).forEach(key => {
      if (this.deliveryFields[key].status === 'invalid' || this.deliveryFields[key].status === 'pristine'){
        this.main.v.fieldShowError (this.deliveryFields[key].field, true);
        this.main.v.feedback(`${this.deliveryFields[key].desc}`, 'red', true);
        if (this.firstError === null) {
          this.firstError = this.deliveryFields[key];
        }
        isValid = false;
      }
    });

    CartCheckItOut.shippingAsBilling = jQuery('#billing-address-checkbox').not(':checked').length;
    if (CartCheckItOut.shippingAsBilling === 0){
      this.main.v.feedback('Billing Validation Required', 'blue', true);
      Object.keys(this.billingFields).forEach(key => {
        if (this.billingFields[key].status === 'invalid' || this.billingFields[key].status === 'pristine'){
          this.main.v.fieldShowError (this.billingFields[key].field, true);
          this.main.v.feedback(`${this.billingFields[key].desc}`, 'red', true);
          if (this.firstError === null) {
            this.firstError = this.billingFields[key];
          }
          isValid = false;
        }
      });
    }

    // If the payment type is credit card, we need to validate the CC fields REALLY well
    if ( CartCheckItOut.paymentOption === 'aligent_directpost_securepay'){

      this.main.v.feedback(`VALIDATE CARD`, 'red', true);
      Object.keys(this.creditCardFields).forEach(key => {
        if (this.creditCardFields[key].status === 'invalid' || this.creditCardFields[key].status === 'pristine'){
          this.main.v.fieldShowError (this.creditCardFields[key].field, true);
          this.main.v.feedback(`${this.creditCardFields[key].desc}`, 'red', true);
          if (this.firstError === null) {
            this.firstError = this.creditCardFields[key];
          }
          isValid = false;
        }
      });
    }

    if (!isValid){
      this.main.v.feedback('Your order isn\'t valid yet. We can\'t process it till it is.', false, true);
      if (this.firstError !== null){
        this.main.v.feedback(`First invalid field was ... ${this.firstError.desc}`, false, true);
        this.main.v.feedback(`Focus field ... ${this.firstError.desc}`, 'blue', true);
        this.main.v.fieldFocus(this.firstError.field);
      }
    } else{
      this.main.m.getUpdatequote ();
      this.main.v.feedback('', 'green', false);
      this.main.v.checkout.showOrderProcess();
    }
    this.firstError = null;
  }

}
