/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/views/ViewCart.js
 *
 */

export default class ViewCart {

  constructor (main) {
    this.main = main;
  }

  show (){
    jQuery('.swg-cart').fadeIn(CartCheckItOut.animationDuration);
    jQuery('.load-checkout').hide();
    jQuery('.promo-feedback').hide();
    jQuery('.gift-feedback').hide();
    jQuery('.totals-loading').hide();
    jQuery('.proceed-loading').hide();
    this.main.c.setTotalDelete ();
    this.main.c.setPromoGiftUI ();
  }

  hideQtySelect (itemSelector){
    jQuery(itemSelector).fadeOut(CartCheckItOut.animationDuration);
  }

  hideError (itemSelector){
    jQuery('#error-'+itemSelector).fadeOut(CartCheckItOut.animationDuration);
  }

  showQtySelect (){
    jQuery('.orderitem-qty').fadeIn(CartCheckItOut.animationDuration);
  }

  showPromocodeLoading (){
    jQuery('.submit-promo').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.promocode-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  hidePromocodeLoading (response){
    jQuery('.promocode-loading').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.submit-promo').fadeIn(CartCheckItOut.animationDuration);
    }
    if (!response.success){
      jQuery('.promo-feedback').html(response.message);
      jQuery('.promo-feedback').fadeIn(CartCheckItOut.animationDuration);
      jQuery('.promo-feedback').removeClass('promo-success');
      this.main.v.fieldShowError (jQuery('#promocode'), false);
    } else {
      jQuery('.promo-feedback').html(response.message);
      jQuery('.promo-feedback').fadeIn(CartCheckItOut.animationDuration);
      jQuery('.promo-feedback').addClass('promo-success');
    }
  }

  showGiftcardLoading (){
    jQuery('.submit-gift').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.giftcard-loading').fadeIn(CartCheckItOut.animationDuration);
    }
  }

  hideGiftcardLoading (response){
    jQuery('.giftcard-loading').fadeOut(CartCheckItOut.animationDuration, showNext);
    function showNext (){
      jQuery('.submit-gift').fadeIn(CartCheckItOut.animationDuration);
    }
    if (!response.success){
      jQuery('.gift-feedback').html(response.message);
      jQuery('.gift-feedback').fadeIn(CartCheckItOut.animationDuration);
      jQuery('.gift-feedback').removeClass('gift-success');
      this.main.v.fieldShowError (jQuery('#giftcard'), false);
    }else{
      jQuery('.gift-feedback').html(response.message);
      jQuery('.gift-feedback').fadeIn(CartCheckItOut.animationDuration);
      jQuery('.gift-feedback').addClass('gift-success');
    }
  }

}
