/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/View.js
 * Handles everything to do with displaying, logging & rendering
 *
 */

import ViewCart from './views/ViewCart';
import ViewCheckout from './views/ViewCheckout';

export default class View {

  constructor(main) {
    this.main = main;
    this.shortName = 'v';
    this.cart = new ViewCart (this);
    this.checkout = new ViewCheckout (this);
  }

  setDependents(dependents) {
    // Set Dependent MVC Classes
    // See https://tinyurl.com/yaqgy73w
    for (let i=0; i<dependents.length; i++){
      this[dependents[i].shortName] = dependents[i];
    }
  }

  transitionScreen (oldScreen, newScreen){
    jQuery(`.${oldScreen}`).fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery(`.${newScreen}`).fadeIn(CartCheckItOut.animationDuration);
    }
  }

  updatePaymentMethods(newMethods) {
    var enabled = newMethods['enabled'];

    if (newMethods['enabled'].length === 0) {
      jQuery('.method-html').hide();
      jQuery('.btn-method').hide();
      jQuery('#no-payment-methods').show();
    } else {
      var newOption = newMethods['enabled'][0];

      jQuery('#no-payment-methods').hide();

      // Hide any payment methods no longer required.
      jQuery('#checkout-payment-method-load .payment-options .method-buttons .btn-method').each(function(index, element){
        var methodName = element.id.substring('button-'.length);
        // If method is no longer available
        var enableIndex = enabled.indexOf(methodName);

        if (enableIndex === -1) {
          jQuery('#button-'+methodName).remove();
          jQuery('#method-'+methodName).remove();
        } else {
          enabled.splice(enableIndex, 1);
        }
      }.bind(this));

      // Add new payment methods.
      enabled.forEach(function(element) {
        jQuery('#button-clear').before(newMethods['methods'][element]['button']);
        jQuery('#method-htmls').append(newMethods['methods'][element]['html']);

        if (element === 'aligent_directpost_securepay') {
          this.main.c.deliverypayment.setupCCClickers();
        }
        this.main.c.deliverypayment.setupPaymentUI('.payment-option#'+element);
      }.bind(this));

      // Change active if there are none.
      if (jQuery('.method-html.active').length === 0) {
        CartCheckItOut.paymentOption = newOption;

        jQuery('#method-'+ newOption).addClass('active');
        jQuery('#payment_form_'+ newOption).show();
        jQuery('#method-'+ newOption).fadeIn(CartCheckItOut.animationDuration);

        jQuery('.payment-option').each(function() {
          if (jQuery(this).prop('id') === CartCheckItOut.paymentOption){
            jQuery(this).attr('src',`${CartCheckItOut.imagePath}payment/${jQuery(this).prop('id')}_over.png`);
          }else{
            jQuery(this).attr('src',`${CartCheckItOut.imagePath}payment/${jQuery(this).prop('id')}.png`);
          }
        });
      }
      this.main.v.checkout.adjustProceedButton(newOption);
    }
  }

  updateShipping (){
    if (CartCheckItOut.shippingBanner.freeShippingPossible){
        jQuery('.cart-shipping-banner').show();
      let bannerHTML;
      if (CartCheckItOut.shippingBanner.freeShipping){
        bannerHTML = `Enjoy&nbsp;<span class="bold">Free Express Shipping</span>&nbsp;on us!`
      } else {
        bannerHTML = `You are&nbsp;AUD $&nbsp;<strong>${CartCheckItOut.shippingBanner.amountRemaining}</strong>&nbsp;away from&nbsp;<span class="bold">Free Shipping</span>`
      }
      jQuery('#shipping-banner-content').html(bannerHTML);
    } else {
      jQuery('.cart-shipping-banner').hide();
    }
  }

  updateInternationalShippingTax() {
      if (CartCheckItOut.shippingBanner.freeShippingPossible){
          jQuery('#international-orders-tax').hide();
      } else {
          jQuery('#international-orders-tax').show();
      }
  }

  updateAtl() {
      if (CartCheckItOut.shippingBanner.freeShippingPossible){
          jQuery('#authority_to_leave_group').show();
      } else {
          jQuery('#authority_to_leave_group').hide();
      }
  }

  showTotalsLoading (){
    jQuery('.totals-loading').fadeIn(CartCheckItOut.animationDuration);
    jQuery('.totals-display').html('');
  }

  showUpdatedTotals (){
    jQuery('.totals-loading').fadeOut(CartCheckItOut.animationDuration);
    let totalGrid = '';
    for (let i = 0; i < CartCheckItOut.totals.length; i++){
      let className = '';
      let value = '';
      if (CartCheckItOut.totals[i].code === 'grand_total'){
        className = 'grand_total';
      }
      let totalTitle = CartCheckItOut.totals[i].title;
      if (CartCheckItOut.totals[i].code.indexOf("giftcardaccount") !== -1) {
        let giftcardCode = CartCheckItOut.totals[i].title.replace(/.*\(|\)/gi,'');
        totalTitle = `
          <a 
              href="#"
              id="${giftcardCode}"
              class="btn-delete remove-giftcard"
              title="remove ${CartCheckItOut.totals[i].title}"">
              remove ${CartCheckItOut.totals[i].title}
          </a>&nbsp;
        ` + totalTitle;
      }

      if (CartCheckItOut.totals[i].code.indexOf("discount") !== -1) {
        totalTitle = `
          <a 
              href="#"
              class="btn-delete remove-discount"
              title="remove ${CartCheckItOut.totals[i].title}">
              remove
          </a>&nbsp;
        ` + totalTitle;
      }

      value = CartCheckItOut.totals[i].value;
      if (value == "$0.00") {
        value = 'FREE';
      }

      totalGrid += `
        <div class="flexgrid ${className}">
            <div class="flexgrid-col flex-left">${totalTitle}</div>
            <div class="flexgrid-col flex-right">${value}</div>
        </div>
      `;
    }
    jQuery('.totals-display').html(totalGrid);
    this.main.c.setTotalDelete ();
  }

  updateAfterpay() {
    if (CartCheckItOut.afterpayTotals !== "undefined" && CartCheckItOut.afterpayenabled) {
      jQuery('#payment_form_afterpaypayovertime .instalments .cost li').html(CartCheckItOut.afterpayTotals.instalments);
      jQuery('#payment_form_afterpaypayovertime .header-text').html(CartCheckItOut.afterpayTotals.header_text);
    }
  }

  setupPasswordScreen (){
    let title;
    let instructions;
    if (CartCheckItOut.check){
      title = 'Welcome back!';
      instructions = 'Please enter your password to continue to delivery &amp; payment';
    } else {
      title = 'Welcome aboard!';
      instructions = `Please create a password for <i>${CartCheckItOut.email}</i> to continue to delivery &amp; payment`;

      jQuery('#forgotten-password').hide();
    }
    jQuery('#password-title').html(title);
    jQuery('#password-instructions').html(instructions);
    this.main.c.password.setUI ();
    setTimeout(function (){
      this.fieldFocus(jQuery('#input-password'));
    }.bind(this), 1000);
    jQuery('.inchoo-socialconnect-facebook-inner a').html(
      `<img src="${CartCheckItOut.imagePath}social/facebook.png" />`
    );
    jQuery('.inchoo-socialconnect-google-inner a').html(
      `<img src="${CartCheckItOut.imagePath}social/google.png" />`
    );
  }

  showCartLoading (){
    jQuery('#cart-proceed').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.proceed-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  showEmailLoading (){
    jQuery('.email-form').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.email-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  showPasswordLoading (){
    jQuery('.password-form').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      if(CartCheckItOut.checkoutmode === 'guest'){
        jQuery('#password_loading_message').html('Proceeding as guest');
      } else if (CartCheckItOut.check) {
        jQuery('#password_loading_message').html('Checking password');
      }else{
        jQuery('#password_loading_message').html('Creating account');
      }
      jQuery('.password-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  showPreviousCartLoading (){
    jQuery('#previouscart-body').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('#previouscart_loading_message').html('Processing...');
      jQuery('.previouscart-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  showPasswordError (){
    jQuery('.password-loading').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.password-form').fadeIn(CartCheckItOut.animationDuration);
    }
    jQuery('#password-title').html(`Incorrect password`);
    this.fieldFocus(jQuery('#input-password'));
  }

  showDeliveryPayment (){
    this.checkout.hideScreen ('previouscart');
    this.v.transitionScreen ('password', 'delivery');
    this.checkout.showScreen ('payment');
    this.main.c.deliverypayment.setUI();
  }

  showPreviousCart(count, content) {
    this.main.c.previouscart.setUI(count, content);
    this.v.transitionScreen ('password', 'previouscart');
  }

  fieldFocus (field){
    field.focus();
  }

  fieldShowError (field, showCross){
    jQuery(field).removeClass ('input-ticked');
    jQuery(field).removeClass('input-error-fade');
    if (showCross){
      jQuery(field).addClass('input-error');
    }else{
      jQuery(field).addClass('input-error-no-cross');
    }
    setTimeout(function(){
      jQuery(field).addClass('input-error-fade');
    }, CartCheckItOut.animationDuration );
    jQuery(field).effect('shake', {distance: 5}, CartCheckItOut.animationDuration);
  }

  fieldShowValid (field){
    jQuery(field).removeClass('input-error-fade');
    jQuery(field).removeClass ('input-error');
    jQuery(field).removeClass('input-error-no-cross');
    jQuery(field).addClass ('input-ticked');
  }

  fieldReset (field){
    jQuery(field).removeClass('input-error-fade');
    jQuery(field).removeClass ('input-error');
    jQuery(field).removeClass('input-error-no-cross');
    jQuery(field).removeClass ('input-ticked');
  }

  feedback (message, colour, append){
    let className = 'text';
    switch (colour){
      case 'green':
        className = 'green-text';
        break;
      case 'red':
        className = 'red-text';
        break;
      case 'blue':
        className = 'blue-text';
        break;
    }
    if (append){
      //jQuery('.place-order-feedback').append(`<br /><span class="${className}">${message}</span>`);
    } else {
      //jQuery('.place-order-feedback').html(`<span class="${className}">${message}</span>`);
    }
  }

}
