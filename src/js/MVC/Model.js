/**
 * Aligent CartCheckItOut
 *
 * @category   Aligent
 * @package    aligent-cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * src/js/Model.js
 * Load and manipulate data model
 *
 */

export default class Model {

  constructor(main) {
    this.main = main;
    this.shortName = 'm';

    // The Model Class is our run-time data store.
    // We could use Redux if we were feeling flash.
    // In this case we'll keep our data in a globally accessible
    //  object set in the template called CartCheckItOut

    CartCheckItOut.animationDuration = 500;
    CartCheckItOut.manualDeliveryAddress = false;
    CartCheckItOut.manualBillingAddress = false;
    CartCheckItOut.billingAddress = false;
    CartCheckItOut.redirectUrl = false;
    CartCheckItOut.newUser = false;
    CartCheckItOut.cvv = false;
  }

  setDependents(dependents) {
    // Set Dependent MVC Classes
    // See https://tinyurl.com/yaqgy73w
    for (let i=0; i<dependents.length; i++){
      this[dependents[i].shortName] = dependents[i];
    }
  }

  setBilling () {
      let region = '';
      let region_id = '';
      if (CartCheckItOut.billingStates === 'select'){
        region_id = jQuery('#billing-state-select').val();
        region = jQuery('#billing-state-select option:selected').text();
      }else{
        region = jQuery('#billing-state-text').val();
      }
      let billing = {
          'email': CartCheckItOut.email,
          'firstname': jQuery('#input-billing-firstname').val(),
          'lastname': jQuery('#input-billing-lastname').val(),
          'street': jQuery('#billing-street-address-ip').val(),
          'city': jQuery('#billing-city').val(),
          'region': region,
          'region_id': region_id,
          'postcode': jQuery('#billing-postcode').val(),
          'country_id': jQuery('#select-billing').val(),
          'telephone': jQuery('#billing-telephone').val(),
      };
      return billing;
  }

  setShipping () {
      let region = '';
      let region_id = '';
      if (CartCheckItOut.deliveryStates === 'select'){
        region_id = jQuery('#delivery-state-select').val();
        region = jQuery('#delivery-state-select option:selected').text();
      }else{
        region = jQuery('#delivery-state-text').val();
      }
      let shipping = {
          'email': CartCheckItOut.email,
          'firstname': jQuery('#input-firstname').val(),
          'lastname': jQuery('#input-lastname').val(),
          'street': jQuery('#delivery-street-address').val(),
          'city': jQuery('#delivery-city').val(),
          'region': region,
          'region_id': region_id,
          'postcode': jQuery('#delivery-postcode').val(),
          'country_id': jQuery('#select-shipping').val(),
          'company': jQuery('#business-name').val(),
          'telephone': jQuery('#delivery-telephone').val(),
      };
      return shipping;
  }

  changeCountry(countryid) {
      this.main.v.showTotalsLoading();
      this.ajaxRequest('/cartcheckitout/ajax/updateShippingCountry',{
          'form_key': CartCheckItOut.formkey,
          'request': 'updatecountrycart',
          'country_id': countryid,
          'mode': CartCheckItOut.mode
      })
  }

  changeBillingCountry(countryid) {
    this.ajaxRequest('/cartcheckitout/ajax/updateBillingCountry',{
      'form_key': CartCheckItOut.formkey,
      'request': 'updatebillingcountrycart',
      'country_id': countryid,
      'mode': CartCheckItOut.mode
    })
  }

  setPaymentOption (option){
    const previousOption = CartCheckItOut.paymentOption;
    CartCheckItOut.paymentOption = option;
    this.main.v.checkout.changePaymentOption(previousOption, CartCheckItOut.paymentOption);
  }

  getCustomerCheck (email){
    CartCheckItOut.email = email;
    this.ajaxRequest('/cartcheckitout/ajax/customercheck',{
      'form_key': CartCheckItOut.formkey,
      'request': 'customercheck',
      'email': email
    })
  }

  getTotals (){
    this.ajaxRequest('/cartcheckitout/ajax/getTotals',{
      'form_key': CartCheckItOut.formkey,
      'request': 'totals',
      'mode': CartCheckItOut.mode
    })
  }

  getChangeQty (itemId, qty){
    this.ajaxRequest('/cartcheckitout/ajax/updateQty',{
      'form_key': CartCheckItOut.formkey,
      'request': 'updateQty',
      'itemId': itemId,
      'qty': qty
    })
  }

  getRemovepromocode (){
    this.ajaxRequest('/cartcheckitout/ajax/removepromocode',{
      'form_key': CartCheckItOut.formkey,
      'request': 'removepromocode',
    })
  }

  getUpdatequote (){
    this.ajaxRequest('/cartcheckitout/ajax/updatequote',{
      'form_key': CartCheckItOut.formkey,
      'request': 'updatequote',
      'billing': this.setBilling(),
      'shipping': this.setShipping(),
      'atl': jQuery('#authority-to-leave:checked').length,
      'atl_instructions': jQuery('#input-authority').val(),
      'subscribe': jQuery('#newsletter-checkbox:checked').length,
      'paymentOption': CartCheckItOut.paymentOption,
      'shipping_as_billing': jQuery('#billing-address-checkbox').not(':checked').length
    })
  }

  getPaymentInfo() {
      let namedInputs = jQuery('.payment-options .method-html.active input[name]');
      let namedInputs2 = jQuery('.payment-options .method-html.active select[name]');
      let params = {};
      params['form_key'] = CartCheckItOut.formkey;
      params['request'] = 'placeorder';
      namedInputs.each(function(index, value) {
          var obj = jQuery(value);
          params[obj.attr('name')] = obj.val();
      });
      namedInputs2.each(function(index, value) {
          var obj = jQuery(value);
          params[obj.attr('name')] = obj.val();
      });
      params['payment[method]'] = CartCheckItOut.paymentOption;
      return params;
  }

  getRemovegiftcard (giftcard){
    this.ajaxRequest('/cartcheckitout/ajax/removegiftcard',{
      'form_key': CartCheckItOut.formkey,
      'request': 'removegiftcard',
      'giftcard': giftcard
    })
  }

  getLogin (email, password){
    this.ajaxRequest('/cartcheckitout/ajax/login',{
      'form_key': CartCheckItOut.formkey,
      'request': 'login',
      'confirmed': 0,
      'email': email,
      'password': password
    })
  }

  getLoginConfirmed (email, password, merge){
    this.ajaxRequest('/cartcheckitout/ajax/login',{
      'form_key': CartCheckItOut.formkey,
      'request': 'login',
      'confirmed': 1,
      'email': email,
      'password': password,
      'merge_cart': merge
    })
  }

  getLoginRedirect (email, password){
    this.ajaxRequest('/cartcheckitout/ajax/login',{
      'form_key': CartCheckItOut.formkey,
      'request': 'login_redirect',
      'confirmed': 1,
      'email': email,
      'password': password,
      'merge_cart': 1
    })
  }

  setGuest(email) {
    this.ajaxRequest('/cartcheckitout/ajax/guestcheckout',{
      'form_key': CartCheckItOut.formkey,
      'request': 'guest_checkout',
      'email': email
    })
  }

  getNewAccount (email, password){
    this.ajaxRequest('/cartcheckitout/ajax/newaccount',{
      'form_key': CartCheckItOut.formkey,
      'request': 'newaccount',
      'email': email,
      'password': password
    })
  }

  getUpdateAccountNames(email, password, firstname, lastname) {
      if (CartCheckItOut.newUser) {
          CartCheckItOut.newUser = false;
          this.ajaxRequest('/cartcheckitout/ajax/updatenewaccount',{
              'form_key': CartCheckItOut.formkey,
              'request': 'newaccountupdate',
              'email': email,
              'password': password,
              'firstname': firstname,
              'lastname': lastname
          })
      }
  }

  getApplyPromo (promocode){
    this.ajaxRequest('/cartcheckitout/ajax/applypromocode',{
      'form_key': CartCheckItOut.formkey,
      'request': 'applypromocode',
      'promocode': promocode
    })
  }

  getApplyGiftcard (giftcard){
    this.ajaxRequest('/cartcheckitout/ajax/applygiftcard',{
      'form_key': CartCheckItOut.formkey,
      'request': 'applygiftcard',
      'giftcard': giftcard
    })
  }

  getWishlist (url){
    this.ajaxRequest(url,{})
  }

  getForgottenPasswordEmail() {
    this.ajaxRequest('/cartcheckitout/ajax/forgottenPassword',{
      'form_key': CartCheckItOut.formkey,
      'request': 'forgottenpassword',
      'email': CartCheckItOut.email
    })
  }

  removeItem(itemid) {
    this.main.v.showTotalsLoading();

    this.ajaxRequest('/cartcheckitout/ajax/removeItem',{
      'form_key': CartCheckItOut.formkey,
      'request': 'removeitem',
      'item_id': itemid
    })
  }

  ajaxRequest (endPoint, postData){
    const request = jQuery.ajax({
      url: endPoint,
      method: "POST",
      data: postData,
      dataType: "html"
    });

    request.done(function( msg ) {
      this.main.m.dispatchResponse(JSON.parse(msg));
    }.bind(this));

    request.fail(function( jqXHR, textStatus ) {
      this.main.v.checkout.showOrderError (textStatus);
    });

  }

  dispatchResponse(json){
    if (json.aligent_directpost || CartCheckItOut.paymentOption === 'afterpaypayovertime' || CartCheckItOut.paymentOption === 'free') {
      // Do anything specific for payment methods which do not follow cartcheckitout routing return types.
      this.main.v.checkout.hideOrderError ();
    } else {
      if (!json.data.success){
        this.main.v.checkout.showOrderError (json.data.message);
      }else{
        this.main.v.checkout.hideOrderError ();
      }
    }

    switch(json.type) {
      case 'applypromocode':
        this.main.v.cart.hidePromocodeLoading(json.data);
        if (json.data.success){
          this.main.v.showTotalsLoading ();
          this.getTotals ();
        }

        break;

      case 'removepromocode':
        this.getTotals ();
        break;

      case 'applygiftcard':
        this.main.v.cart.hideGiftcardLoading(json.data);
        if (json.data.success) {
          this.main.v.showTotalsLoading();
          this.getTotals();
        }
        break;

      case 'removegiftcard':
        this.getTotals ();
        break;

      case 'totals':
        CartCheckItOut.totals = json.data.totals;
        CartCheckItOut.shippingBanner = json.data.shippingBanner;
        this.main.v.updateShipping ();
        this.main.v.showUpdatedTotals ();

        if (json.data.afterpay !== undefined) {
          CartCheckItOut.afterpayTotals = json.data.afterpay;
          this.main.v.updateAfterpay ();
        }

        if (json.data.paymentMethods !== undefined) {
          this.main.v.updatePaymentMethods (json.data.paymentMethods);
        }
        break;

      case 'customercheck':
        CartCheckItOut.check = json.data;
        this.main.v.transitionScreen ('email', 'password');
        this.main.v.setupPasswordScreen ();

        Event.fire(document, 'checkout:email_updated');
        break;

      case 'login':
        if (json.data.success) {
            if (json.data.isNew) {
                // Not logged in as we are waiting for firstname / lastname
                CartCheckItOut.newUser = true;
            } else {
              if(json.data.previous_cart) {
                this.main.v.showPreviousCart(json.data.previous_cart_count, json.data.previous_cart_content);
                break;
              } else {
                if (json.data.mergeCart) {
                  CartCheckItOut.totals = json.data.totals;
                  CartCheckItOut.shippingBanner = json.data.shippingBanner;
                  this.main.v.updateShipping ();
                  this.main.v.showUpdatedTotals ();

                  if (json.data.afterpay !== undefined) {
                    CartCheckItOut.afterpayTotals = json.data.afterpay;
                    this.main.v.updateAfterpay ();
                  }

                  this.main.c.previouscart.transferCartToSummary();
                }

                CartCheckItOut.customer.shipping = json.data.deliveryAddress;
                CartCheckItOut.customer.billing = json.data.billingAddress;
              }
            }
            if(json.data.formkey) {
                CartCheckItOut.formkey = json.data.formkey;
                if (window.Afterpay !== undefined) {
                  window.Afterpay.saveUrl = window.Afterpay.saveUrl.substring(0, window.Afterpay.saveUrl.lastIndexOf('/form_key/') + 1) + '/form_key/' + json.data.formkey +'/';
                }
            }
            this.main.v.showDeliveryPayment();
        }else{
          this.main.v.showPasswordError();
        }
        break;
      case 'login_redirect':
        if (json.data.success) {
          window.location = '/checkout/cart/';
        } else {
          this.main.v.showPasswordError();
        }
        break;

      case 'newaccount':
        if (json.data) {
          // Set the flag that we have a new user.
          CartCheckItOut.newUser = true;

          this.main.v.showDeliveryPayment();
        }else{
          this.main.v.showPasswordError();
        }
        break;

      case 'newaccountupdate':
          if (json.data.success) {
              CartCheckItOut.newUser = false;

              if(json.data.formkey) {
                  CartCheckItOut.formkey = json.data.formkey;
                  if (window.Afterpay !== undefined) {
                    window.Afterpay.saveUrl = window.Afterpay.saveUrl.substring(0, window.Afterpay.saveUrl.lastIndexOf('/form_key/') + 1) + '/form_key/' + json.data.formkey +'/';
                  }
              }
          } else {
              // Do nothing.
          }
          break;

      case 'updateQty':
        if (json.data.success) {
          this.main.v.cart.showQtySelect();
          this.main.v.cart.hideError(json.data.item_id);
          this.main.v.showTotalsLoading();
          this.getTotals();
        } else {
          location.reload();
        }
        break;

      case 'updatequote':
        if (json.data.redirectUrl !== null && typeof json.data.redirectUrl !== "undefined"){
          CartCheckItOut.redirectUrl = json.data.redirectUrl;
        }
        if(json.data.success) {
          this.placeOrder ();
        } else{
          this.main.v.feedback('Could not update quote because...', 'red', true);
          this.main.v.feedback(json.data.message, 'red', true);
        }
        break;

      case 'updatecountrycart':
          if(json.data.success) {
              CartCheckItOut.totals = json.data.totals;
              CartCheckItOut.shippingBanner = json.data.shippingBanner;
              if (json.data.afterpay !== undefined) {
                CartCheckItOut.afterpayTotals = json.data.afterpay;
                this.main.v.updateAfterpay ();
              }
              this.main.v.updateShipping ();
              this.main.v.showUpdatedTotals ();
              this.main.v.updateAtl ();
              this.main.v.updateInternationalShippingTax();

              if (json.data.paymentMethods !== undefined) {
                this.main.v.updatePaymentMethods (json.data.paymentMethods);
              }

          }
        break;
      case 'updatebillingcountrycart':
        if(json.data.success) {
          //updatePaymentMethods.
          this.main.v.updatePaymentMethods (json.data.paymentMethods);
        }
        break;
      case 'guest_checkout':
        if(json.data.success) {
          this.main.v.showDeliveryPayment();
        }
        break;
      case 'removeitem':
        if(json.data.success) {
          if (json.data.items_remaining == 0) {
            jQuery('#swg-cart-empty').show();
            jQuery('#swg-cart-contents').hide();
          } else {
            var item = 'Item';
            if(json.data.items_remaining > 1) {
              item = 'Items';
            }
            jQuery('#swg-cart-totalitems').html(json.data.items_remaining+' '+item);

            CartCheckItOut.totals = json.data.totals;
            CartCheckItOut.shippingBanner = json.data.shippingBanner;
            this.main.v.updateShipping ();
            this.main.v.showUpdatedTotals ();

            if (json.data.afterpay !== undefined) {
              CartCheckItOut.afterpayTotals = json.data.afterpay;
              this.main.v.updateAfterpay ();
            }
          }
          Event.fire(document, 'personalisationcookie:render');
        }
        break;
      case 'forgottenpassword':
        var content = '',
          addClass = 'success',
          removeClass = 'error';

        if(!json.data.success) {
          content = json.data.message;
          addClass = 'error';
          removeClass = 'success';
        } else {
          content = json.data.message;
        }

        jQuery('#password-forgotten-loading').hide();
        jQuery('#password-forgotten').show();

        var textDom = jQuery('#password-forgotten-text');

        if (content.length !== 0) {
          textDom.html(content);
        }
        textDom.addClass(addClass);
        textDom.removeClass(removeClass);
        break;
      default:
        if (json.aligent_directpost) {
          var aligentDirectpostInstance = Aligent.Directpost.getInstance();
          aligentDirectpostInstance.submitUrl = json.redirect;
          aligentDirectpostInstance.createForm();
          aligentDirectpostInstance.storedFields = aligentDirectpostInstance.storedFields.merge(json.aligent_directpost_data);
          this.isSuccess = true;
          aligentDirectpostInstance.submitForm();
          return;
        }
        if(CartCheckItOut.paymentOption === 'afterpaypayovertime') {
          if (json.success) {
            if( window.afterpayReturnUrl === false ) {
              AfterPay.init();
            }
            else {
              AfterPay.init({
                relativeCallbackURL: window.afterpayReturnUrl
              });
            }
            switch (window.Afterpay.redirectMode) {
              case 'lightbox':
                AfterPay.display({
                  token: json.token
                });
                break;
              case 'redirect':
                AfterPay.redirect({
                  token: json.token
                });
                break;
            }
          } else {
            if (json.redirect) {
              this.isSuccess = false;
              location.href = json.redirect;
            } else {
              this.main.v.feedback(`Error: ${json.message}`, 'red', false);
            }
          }
        } else if(CartCheckItOut.paymentOption === 'free') {
          if (json.success) {
            location.href = '/checkout/onepage/success';
          }
        }
    }
  }

  placeOrder (){
    if(CartCheckItOut.redirectUrl !== false) {
      window.location.assign(CartCheckItOut.redirectUrl);
    } else {
      if (CartCheckItOut.paymentOption == 'afterpaypayovertime' && typeof window.Afterpay.saveUrl !== "undefined") {
        this.ajaxRequest(window.Afterpay.saveUrl,this.getPaymentInfo());
      } else {
        this.ajaxRequest('/checkout/onepage/saveOrder',this.getPaymentInfo());
      }
    }
  }

}
