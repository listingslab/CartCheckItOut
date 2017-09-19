/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/views/ViewCheckout.js
 *
 */

export default class ViewCheckout {

  constructor (main) {
    this.main = main;
  }

  show (){
    jQuery('.swg-checkout').fadeIn(CartCheckItOut.animationDuration);
    if (!CartCheckItOut.loggedIn){
      this.showScreen ('email');
      this.main.v.fieldFocus(jQuery('#input-email'));
      jQuery('.email-loading').hide();
      jQuery('.password-loading').hide();
      jQuery('.previouscart-loading').hide();
    } else {
      this.showScreen ('delivery');
      this.showScreen ('payment');
      this.main.c.deliverypayment.setUI();

    }
    this.changePaymentOption(CartCheckItOut.paymentOption, CartCheckItOut.paymentOption);
    var billingAddress = jQuery('.billing-address-hidden');

    if (billingAddress.hasClass('hidden')) {
      jQuery('.billing-address-hidden').hide();
    }

    jQuery('.billing-address-manual-entry').hide();
    jQuery('.delivery-address-manual-entry').hide();
    jQuery('.promo-feedback').hide();
    jQuery('.gift-feedback').hide();
    jQuery('.totals-loading').hide();
    jQuery('.order-loading').hide();
    jQuery('.place-order-feedback').hide();
    jQuery('.cvv-image').hide();

    this.main.c.setTotalDelete ();
    this.main.c.setPromoGiftUI ();

  }

  updateAccountName(firstname, lastname) {
      if(CartCheckItOut.newUser) {
          if(firstname.length != 0 && lastname.length != 0) {
              this.main.m.getUpdateAccountNames(jQuery('#input-email').val(), jQuery('#input-password').val(), firstname, lastname);
          }
      }
  }

  toggleCVV () {
    if (!CartCheckItOut.cvv){
      jQuery('.cvv-image').fadeIn(CartCheckItOut.animationDuration);
      CartCheckItOut.cvv = true;
    }else{
      jQuery('.cvv-image').fadeOut(CartCheckItOut.animationDuration);
      CartCheckItOut.cvv = false;
    }
  }

  toggleBillingAddress (){
    if (CartCheckItOut.billingAddress){
      CartCheckItOut.billingAddress = false;
      jQuery('.billing-address-hidden').fadeOut(CartCheckItOut.animationDuration);
    } else {
      CartCheckItOut.billingAddress = true;
      jQuery('.billing-address-hidden').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  toggleAuthorityToLeave (){
    if (CartCheckItOut.authorityToLeave){
      CartCheckItOut.authorityToLeave = false;
      jQuery('.authority-instructions').fadeOut(CartCheckItOut.animationDuration);
    } else {
      CartCheckItOut.authorityToLeave = true;
      jQuery('.authority-instructions').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  toggleNewsletter (){
    if (CartCheckItOut.newsletter){
      CartCheckItOut.newsletter = false;
    } else {
      CartCheckItOut.newsletter = true;
    }
  }

  toggleManualAddress (){
    if (CartCheckItOut.manualDeliveryAddress){
      CartCheckItOut.manualDeliveryAddress = false;
      jQuery('.delivery-address-manual-entry').fadeOut(CartCheckItOut.animationDuration);
    } else {
      CartCheckItOut.manualDeliveryAddress = true;
      jQuery('.delivery-address-manual-entry').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  toggleManualBillingAddress (){
    if (CartCheckItOut.manualBillingAddress){
      CartCheckItOut.manualBillingAddress = false;
      jQuery('.billing-address-manual-entry').fadeOut(CartCheckItOut.animationDuration);
    } else {
      CartCheckItOut.manualBillingAddress = true;
      jQuery('.billing-address-manual-entry').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  showScreen (screen){
    jQuery(`.${screen}`).fadeIn(CartCheckItOut.animationDuration);
  }
  hideScreen (screen){
    jQuery(`.${screen}`).fadeOut(CartCheckItOut.animationDuration);
  }

  changePaymentOption (oldOption, newOption){
    jQuery(`#method-${oldOption}`).removeClass('active');
    jQuery(`#method-${oldOption}`).fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery(`#method-${newOption}`).addClass('active');
      jQuery(`#payment_form_${newOption}`).show();
      jQuery(`#method-${newOption}`).fadeIn(CartCheckItOut.animationDuration);
    }
    jQuery('.payment-option').each(function() {
      if (jQuery(this).prop('id') === CartCheckItOut.paymentOption){
        jQuery(this).attr('src',`${CartCheckItOut.imagePath}payment/${jQuery(this).prop('id')}_over.png`);
      }else{
        jQuery(this).attr('src',`${CartCheckItOut.imagePath}payment/${jQuery(this).prop('id')}.png`);
      }
    });

    this.adjustProceedButton(newOption);
  }

  adjustProceedButton(newOption) {
    switch(newOption) {
      case 'paypal_express':
        jQuery('#checkout-proceed').attr('value', 'CHECKOUT WITH PAYPAL');
        break;
      case 'afterpaypayovertime':
        jQuery('#checkout-proceed').attr('value', 'CHECKOUT WITH AFTERPAY');
        break;
      default:
        jQuery('#checkout-proceed').attr('value', 'PLACE YOUR ORDER');
        break;
    }
  }

  showOrderError (ajaxMessage){
    jQuery('.checkout-error').html(ajaxMessage);
    jQuery('.checkout-error').fadeIn(CartCheckItOut.animationDuration);
    this.hideOrderProcess ();
  }

  hideOrderError (){
    jQuery('.checkout-error').fadeOut(CartCheckItOut.animationDuration);
  }


  showOrderProcess () {
    jQuery('#checkout-proceed').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext () {
      jQuery('.order-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  hideOrderProcess () {
    jQuery('.order-loading').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext () {
      jQuery('#checkout-proceed').fadeIn(CartCheckItOut.animationDuration);
    }
  }

}
