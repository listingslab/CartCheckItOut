/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/MVC/controllers/ControllerEmail.js
 *
 */

export default class ControllerEmail {

  constructor(main) {
    this.main = main;
    this.setUI ();
  }

  setUI (){
    jQuery('#btn-continue').click(() => {
      this.validate();
    });
    jQuery(window).keypress((event) => {
      if (event.which === 13) {
        event.preventDefault();
        this.validate();
      }
    });
  }

  validate(){
    let isValid = true;
    const inputField = jQuery('#input-email');
    const inputVal = jQuery('#input-email').val();
    if (inputVal === ''){
      isValid = false;
      jQuery('#email-feedback').html('Email address must not be blank');
      this.main.v.fieldShowError (inputField, true);
      return;
    }
    if (!this.emailCheck(inputVal)){
      isValid = false;
      jQuery('#email-feedback').html('Email address must be valid');
      this.main.v.fieldShowError (inputField, true);
      return;
    }
    if (isValid){
      this.main.m.getCustomerCheck (inputVal);
      this.main.v.fieldShowValid (inputField);
      this.main.v.showEmailLoading ();
    }
  }

  emailCheck (email){
    // Check for a valid email address (@ sign, tld etc)
    // returns true if valid, false if not. http://hexillion.com/samples/
    const reEmail = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
    if(!email.match(reEmail)) {
      return false;
    }
    return true;
  }

}
