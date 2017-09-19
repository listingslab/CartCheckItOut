/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/MVC/controllers/ControllerPassword.js
 *
 */

export default class ControllerPassword {

  constructor(main) {
    this.main = main;
  }

  setUI (){
    jQuery(window).unbind('keypress');
    jQuery('#btn-password-continue').click(() => {
      this.validate();
    });
    jQuery(window).keypress((event) => {
      if (event.which === 13) {
        event.preventDefault();
        this.validate();
      }
    });
    jQuery('#checkout-as-guest').click((event) => {
      CartCheckItOut.checkoutmode = 'guest';
      this.main.v.showPasswordLoading();

      this.main.m.setGuest(CartCheckItOut.email);

      return false;
    });

    jQuery('#forgotten-password').click((event) => {
      jQuery('#password-input').hide();
      jQuery('#forgotten-password').hide();
      jQuery('#password-forgotten-loading').show();
      this.main.m.getForgottenPasswordEmail();

      return false;
    });

    jQuery('#btn-password-retry').click((event) => {
      jQuery('#password-forgotten').hide();
      jQuery('#password-input').show();
      jQuery('#forgotten-password').show();

      return false;
    });

  }

  validate(){
    let isValid = true;
    const inputField = jQuery('#input-password');
    const inputVal = jQuery('#input-password').val();
    if (inputVal === ''){
      isValid = false;
      jQuery('#password-feedback').html('Password must not be blank');
      this.main.v.fieldShowError (inputField, true);
      return;
    }
    if (inputVal.length < 6){
      isValid = false;
      jQuery('#password-feedback').html('Please enter 6 or more characters');
      this.main.v.fieldShowError (inputField, true);
      return;
    }
    if (isValid){
      this.main.v.fieldShowValid (inputField);
      if (CartCheckItOut.check){
        this.main.m.getLogin (CartCheckItOut.email, inputVal);
      }else{
        this.main.m.getNewAccount (CartCheckItOut.email, inputVal);
      }
      this.main.v.showPasswordLoading ();
    }
  }

}
