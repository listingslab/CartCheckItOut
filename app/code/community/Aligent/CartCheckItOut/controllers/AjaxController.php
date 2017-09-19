<?php
/**
 * Aligent_CartCheckItOut
 *
 * @category   Aligent
 * @package    cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * app/code/community/Aligent/CheckItOut/controllers/AjaxController.php
 * Ajax endpoint for javascript App
 *
 * Mage::helper('Aligent_CartCheckItOut')->testFunc()
 *
 */

class Aligent_CartCheckItOut_AjaxController extends Mage_Core_Controller_Front_Action {

    // Endpoint: /cartcheckitout/ajax/dev
    public function devAction() {
        $helperMethod = Mage::helper('aligent_cartcheckitout')->getDev();
        $r = (object)[
            'request' => 'dev',
            'helper' => 'helperMethod()',
            'timeStamp' => time(),
            'description' => 'What does this action do?',
            'response' => $helperMethod
        ];

        print_r (json_encode($r));
    }

    protected function getInvalidFormKeyResponse() {
        // Add logging here?

        $response = [
            'success' => false,
            'message' => 'Invalid formkey, please refresh your page and try again.',
        ];

        $this->returnJsonResponse($response);
    }

    protected function returnJsonResponse($object) {
        $response = [
            'type' => $this->getRequest()->getParam('request'),
            'data' => $object,
        ];
        $responseJson = Mage::helper('core')->jsonEncode($response);
        $this->getResponse()->setHeader('Content-type', 'application/json');
        $this->getResponse()->setBody($responseJson);
    }

    /**
     * Add a promo card to the quote.
     * return json response.
     */
    public function applypromocodeAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $response = [];
        $couponCode = trim($this->getRequest()->getParam('promocode'));

        if (strlen($couponCode) != 0) {
            try {
                $return = Mage::helper('aligent_cartcheckitout/coupongiftcard')->applyCouponCode($couponCode);
                $response = [
                    'success' => true,
                    'message' => 'Your promo code has been applied.'
                ];
            } catch(Exception $e) {
                $response = [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        } else {
            $response = [
                'success' => false,
                'message' => 'Cannot apply an empty coupon.',
            ];
        }

        $this->returnJsonResponse($response);
    }

    /**
     * Remove a promo card from the quote.
     * return json response.
     */
    public function removepromocodeAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        $response = [];

        try {
            $return = Mage::helper('aligent_cartcheckitout/coupongiftcard')->applyCouponCode('');
            $response = [
                'success' => true,
                'message' => 'Success'
            ];
        } catch(Exception $e) {
            $response = [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }

        $this->returnJsonResponse($response);
    }

    /**
     * Add a giftcard to the quote.
     * return json response.
     */
    public function applygiftcardAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $response = [];
        $giftCardCode = trim($this->getRequest()->getParam('giftcard'));

        if (strlen($giftCardCode) != 0) {
            try {
                $return = Mage::helper('aligent_cartcheckitout/coupongiftcard')->applyGiftCard($giftCardCode);
                $response = [
                    'success' => true,
                    'message' => 'Your Gift Card has been applied.'
                ];
            } catch(Exception $e) {
                $response = [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        } else {
            $response = [
                'success' => false,
                'message' => 'Please enter your giftcard code.',
            ];
        }

        $this->returnJsonResponse($response);
    }


    /**
     * Add a giftcard to the quote.
     * return json response.
     */
    public function removegiftcardAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $response = [];
        $giftCardCode = trim($this->getRequest()->getParam('giftcard'));

        if (strlen($giftCardCode) != 0) {
            try {
                $return = Mage::helper('aligent_cartcheckitout/coupongiftcard')->removeGiftCard($giftCardCode);
                $response = [
                    'success' => true,
                    'message' => 'Success'
                ];
            } catch(Exception $e) {
                $response = [
                    'success' => false,
                    'message' => $e->getMessage()
                ];
            }
        } else {
            $response = [
                'success' => false,
                'message' => 'Please enter your giftcard code to remove.',
            ];
        }

        $this->returnJsonResponse($response);
    }

    /**
     * Return the quote totals in JSON format.
     */
    public function getTotalsAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        $mode = $this->getRequest()->getParam('mode');

        $totals = [
            'success' => true,
            'totals' => Mage::helper('aligent_cartcheckitout/totals')->getQuoteTotals(),
            'shippingBanner' => $this->getFreeShippingArray(),
        ];

        if ($mode == 'checkout') {
            $totals['paymentMethods'] = $this->getPaymentMethods();
        }

        if (Mage::helper('swimwear_base')->isAfterPayEnabled()) {
            $totals['afterpay'] = [
                'instalments' => Mage::helper('afterpay')->calculateInstalment(),
                'header_text' => $this->__('Four interest-free payments totalling ') . Mage::helper('aligent_cartcheckitout/totals')->getGrandTotal()
            ];
        }

        $this->returnJsonResponse($totals);
    }

    protected function getPaymentMethods() {
        $paymentBlock = $this->getLayout()->getBlockSingleton('checkout/onepage_payment_methods');
        $methods = Mage::helper('aligent_cartcheckitout/quote')->getPaymentMethods();

        $paymentMethods = [
            'enabled' => [],
            'methods' => []
        ];

        foreach($methods as $method) {
            $code = $method->getCode();
            $paymentMethods['enabled'][] = $code;
            $paymentMethods['methods'][$code] = [];

            if ($code == 'free') {
                $paymentMethods['methods'][$code]['button'] = '<div class="btn-method" id="button-'. $code .'">
                    <p>'. $method->getTitle() .'</p>
                </div>';
            } else {
                $paymentMethods['methods'][$code]['button'] = '<div class="btn-method" id="button-'. $code .'">
                    <img
                        class="payment-option"
                        alt="'. $paymentBlock->escapeHtml($method->getTitle()) .'"
                        height="57"
                        id="'. $code .'"
                        src="'. $paymentBlock->getSkinUrl("images/aligent/cartcheckitout/payment/". $code .".png") .'"
                    />
                </div>';
            }
            $paymentMethods['methods'][$code]['html'] = '<div class="method-html" id="method-'. $code .'">
                    '. $paymentBlock->getMethodLabelAfterHtml($method) .'
                    '. $paymentBlock->getPaymentMethodFormHtml($method) .'
                </div>';
        }
        return $paymentMethods;
    }

    protected function getFreeShippingArray() {
        $returnArray = array();
        $returnArray['freeShippingPossible'] = false;
        $returnArray['freeShipping'] = false;

        if (Mage::helper('aligent_cartcheckitout/totals')->isFreeShippingPossible()) {
            $returnArray['freeShippingPossible'] = true;
            if (Mage::helper('aligent_cartcheckitout/totals')->hasFreeShipping()) {
                $returnArray['freeShipping'] = true;
            } else {
                $returnArray['amountRemaining'] = Mage::helper('aligent_cartcheckitout/totals')->getDollarsToFreeShip();
            }
        }

        return $returnArray;
    }

    /**
     * Updates quantity of an item in the cart
     */
    public function updateQtyAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $itemId = trim($this->getRequest()->getParam('itemId'));
        $qty = trim($this->getRequest()->getParam('qty'));

        $response = [
            'success' => false,
            'item_id' => $itemId,
        ];

        try {
            Mage::helper('aligent_cartcheckitout/quote')->updateQty($itemId, $qty);
            $response['message'] = 'Successfully updated Qty.';
            $response['success'] = true;
        } catch (Mage_Core_Exception $e) {
            $message = Mage::helper('core')->escapeHtml($e->getMessage());

            if (strpos($message,'The requested quantity for') !== false) {
                $response['message'] = $this->__('The requested quantity is not available.');
            } else {
                $response['message'] = $message;
            }
        } catch (Exception $e) {
            $response['message'] = $this->__('Cannot update shopping cart.');
            Mage::logException($e);
        }

        $this->returnJsonResponse($response);
    }


    /**
     * Returns true or false if a customer with the email provided is found.
     */
    public function customercheckAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $email = trim($this->getRequest()->getParam('email'));

        if (Mage::helper('aligent_cartcheckitout')->isEmarsysEnabled()) {
            Mage::helper('aligent_emarsys')->addEmailToCookie($email);
        }

        $this->returnJsonResponse(Mage::helper('aligent_cartcheckitout/customer')->checkEmailExists($email));
    }


    /**
     * Creates New User Account
     */
    public function newaccountAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $email = trim($this->getRequest()->getParam('email'));
        //intentionally do not trim password as it may intentionally contain a space.
        $password = $this->getRequest()->getParam('password');

        $newAccount = Mage::helper('aligent_cartcheckitout/customer')->createAccount($email, $password);
        $this->returnJsonResponse($newAccount);
    }

    public function updateNewAccountAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $email = trim($this->getRequest()->getParam('email'));
        $firstname = trim($this->getRequest()->getParam('firstname'));
        $lastname = trim($this->getRequest()->getParam('lastname'));

        //intentionally do not trim password as it may intentionally contain a space.
        $password = $this->getRequest()->getParam('password');

        if (!Mage::helper('aligent_cartcheckitout/customer')->isLoggedIn()) {
            try {
                $newAccount = Mage::helper('aligent_cartcheckitout/customer')->updateAccountName($email, $firstname, $lastname);
                $customer = Mage::helper('aligent_cartcheckitout/customer')->login($email, $password);

                $response = [
                    'success' => true,
                    'message' => 'Success.',
                    'formkey' => Mage::getSingleton('core/session')->getFormKey(),
                ];
            } catch(Exception $e) {
                $response = [
                    'success' => false,
                    'message' => $e->getMessage(),
                ];
            }
        } else {
            $response = [
                'success' => false,
                'message' => 'Already logged in.',
            ];
        }

        $this->returnJsonResponse($response);
    }


    /**
     * Logs in the user and returns the customer data if present.
     */
    public function loginAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        $response = [];

        $customerHelper = Mage::helper('aligent_cartcheckitout/customer');

        if (!$customerHelper->isLoggedIn()) {
            $email = trim($this->getRequest()->getParam('email'));
            //Do not trim incase the password has spaces intentionally.
            $password = $this->getRequest()->getParam('password');


            if ($email && $password) {
                try {
                    //if the user has a blank firstname and lastname do not log them in,
                    if ($customerHelper->checkIsNewCustomerByEmail($email)) {
                        //authenticate the credentials but do not login.
                        if ($customerHelper->authenticate($email, $password)) {
                            $response = [
                                'success' => true,
                                'message' => 'Success.',
                                'isNew' => true
                            ];
                        } else {
                            $response = [
                                'success' => false,
                                'message' => 'Incorrect email and password.',
                            ];
                        }
                    } else {
                        $login = true;

                        $confirmed = $this->getRequest()->getParam('confirmed');
                        $mergeCart = $this->getRequest()->getParam('merge_cart');

                        $confirmed = ($confirmed == "1") ? true : false;
                        $mergeCart = ($mergeCart == "1") ? true : false;

                        // If the user has not confirmed what they want to do with previous cart
                        if (!$confirmed) {
                            // Authenticate the user details are correct
                            if ($customerHelper->authenticate($email, $password)) {
                                $previousCart = $customerHelper->getPreviousCart($email);

                                //If there is a previous cart, return it.
                                if(count($previousCart) != 0) {
                                    $login = false;
                                    $cartHtml = '';

                                    foreach($previousCart as $item) {
                                        $cartHtml .= $this->getLayout()
                                            ->createBlock('aligent_cartcheckitout/product_panel')
                                            ->setData('cartproduct', $item)
                                            ->setTemplate('aligent/cartcheckitout/_partials/product-panel.phtml')
                                            ->toHtml();
                                    }

                                    $response = [
                                        'success' => true,
                                        'previous_cart' => true,
                                        'previous_cart_count' => count($previousCart),
                                        'previous_cart_content' => $cartHtml,
                                        'message' => 'Found previous cart contents',
                                    ];
                                }
                            }
                        }

                        // If we did not find a previous cart which we have not confirmed
                        if ($login) {

                            // If the confirmation said not to merge cart then remove it.
                            if (!$mergeCart) {

                                //Make sure the user is authenticated.
                                if ($customerHelper->authenticate($email, $password)) {
                                    $customerHelper->removePreviousCart($email);
                                }
                            }

                            // Log the customer in
                            $customer = $customerHelper->login($email, $password);
                            list($shipping, $billing) = $customerHelper->getCustomerDetails($customer);

                            // Return the customer details including new formkey
                            $response = [
                                'success' => true,
                                'message' => 'Success.',
                                'previous_cart' => false,
                                'deliveryAddress' => $shipping,
                                'billingAddress' => $billing,
                                'mergeCart' => $mergeCart,
                                'formkey' => Mage::getSingleton('core/session')->getFormKey(),
                            ];

                            // If the cart was merged we need to return the new totals.
                            if ($mergeCart) {
                                $response['totals'] = Mage::helper('aligent_cartcheckitout/totals')->getQuoteTotals();
                                $response['shippingBanner'] = $this->getFreeShippingArray();
                            }
                        }
                    }
                } catch(Exception $e) {
                    $response = [
                        'success' => false,
                        'message' => $e->getMessage(),
                    ];
                }
            } else {
                $response = [
                    'success' => false,
                    'message' => $this->__('Please provide a username and password.'),
                ];
            }
        } else {
            $response = [
                'success' => false,
                'message' => $this->__('User already logged in.'),
            ];
        }

        $this->returnJsonResponse($response);
    }

    public function guestCheckoutAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        $email = trim($this->getRequest()->getParam('email'));

        // Add the guest to the quote.
        Mage::helper('aligent_cartcheckitout/customer')->addCustomerToQuote($email);

        $response = [
            'success' => true,
            'message' => $this->__('Guest checkout saved.'),
        ];

        $this->returnJsonResponse($response);
    }

    public function updateBillingCountryAction() {

        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        if ($this->getRequest()->isPost()) {
            $countryId = $this->getRequest()->getPost('country_id', false);

            if ($countryId) {
                Mage::helper('aligent_cartcheckitout/quote')->applyCountryToBilling($countryId);

                $response = [
                    'success' => true,
                    'paymentMethods' => $this->getPaymentMethods(),
                ];
                $this->returnJsonResponse($response);
                return;
            }
        }

        $response = [
            'success' => false,
            'message' => $this->__('Country code not updated.'),
        ];
        $this->returnJsonResponse($response);
    }

    public function updateShippingCountryAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        if ($this->getRequest()->isPost()) {
            $countryId = $this->getRequest()->getPost('country_id', false);

            if ($countryId) {
                Mage::helper('aligent_cartcheckitout/quote')->applyCountryToShipping($countryId);

                return $this->getTotalsAction();
            }
        }

        $response = [
            'success' => false,
            'message' => $this->__('Country code not updated.'),
        ];
        $this->returnJsonResponse($response);
    }

    /**
     * Updates Quote
     */
    public function updatequoteAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }


        if ($this->getRequest()->isPost()) {
            $updatedQuote = Mage::helper('aligent_cartcheckitout/quote')->updateQuote(
                $this->mapBillingInput(),
                $this->mapShippingInput(),
                $this->mapATLInput(),
                $this->getRequest()->getPost('subscribe', false),
                $this->mapPaymentOptions()
            );

            if (count($updatedQuote) != 0) {
                $errorMessage = $updatedQuote;
                if (is_array($errorMessage)) {
                    $errorMessage = $errorMessage[0];
                }
                $response = [
                    'success' => false,
                    'message' => $errorMessage,
                ];
            } else {
                //getCheckoutRedirectUrl is the url of the final review step. paypal express uses this as it skips the review step.
                //getOrderPlaceRedirectUrl is the url of the complete checkout step. onestepcheckout uses this for place order url.

                // As the onepage checkout acts as both the review and final step we have to account for both possible redirections.
                $redirectUrl = Mage::getSingleton('checkout/type_onepage')->getQuote()->getPayment()->getCheckoutRedirectUrl();
                //$placeOrderUrl = Mage::getSingleton('checkout/type_onepage')->getQuote()->getPayment()->getOrderPlaceRedirectUrl();

                // the redirect needs to be stored such that on the click of place order it should redirect there.
                // if no redirect is present, then the normal step process would take you to the review page and redirect
                // to the standard magento saveOrderAction

                $response = [
                    'success' => true,
                    'redirectUrl' => $redirectUrl
                ];
            }

            $this->returnJsonResponse($response);
        }
        return;
    }

    public function forgottenPasswordAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }
        $success = false;
        $message = $this->__('Could not send forgotten password email.');

        if ($this->getRequest()->isPost()) {
            $email = $this->getRequest()->getPost('email', false);

            if ($email) {
                try {
                    Mage::helper('aligent_cartcheckitout/customer')->sendForgotPassword($email);

                    $success = true;
                    $message = $this->__('If there is an account associated with %s you will receive an email with a link to reset your password.',
                        Mage::helper('aligent_cartcheckitout/customer')->escapeHtml($email));

                } catch (Exception $exception) {
                    $message = $exception->getMessage();
                }
            } else {
                $message = $this->__('Please enter an email.');
            }
        }

        $response = [
            'success' => $success,
            'message' => $message,
        ];

        $this->returnJsonResponse($response);
    }

    public function removeItemAction() {
        if (!$this->_validateFormKey()) {
            return $this->getInvalidFormKeyResponse();
        }

        if ($this->getRequest()->isPost()) {
            $itemId = $this->getRequest()->getPost('item_id');

            Mage::helper('aligent_cartcheckitout/quote')->removeItemFromQuote($itemId);
        }

        $response = [
            'success' => true,
            'message' => 'Item removed successfully',
            'totals' => Mage::helper('aligent_cartcheckitout/totals')->getQuoteTotals(),
            'shippingBanner' => $this->getFreeShippingArray(),
            'items_remaining' => count(Mage::helper('aligent_cartcheckitout')->getCartItems()),
        ];

        $this->returnJsonResponse($response);
    }

    protected function mapBillingInput() {
        return $this->processAddressInput('billing', 'billing_address_id');
    }

    protected function mapATLInput() {
        return [
            'atl' => $this->getRequest()->getPost('atl', true),
            'atl_instructions' => $this->getRequest()->getPost('atl_instructions', ''),
        ];
    }

    protected function mapShippingInput() {
        return $this->processAddressInput('shipping', 'shipping_address_id');
    }

    protected function processAddressInput($address, $address_id) {
        $data = $this->getRequest()->getPost($address, array());

        if(isset($data['street']) && !is_array($data['street'])) {
            $data['street'] = [
                $data['street']
            ];
        }

        $data['same_as_billing'] = $this->getRequest()->getPost('shipping_as_billing', 1);

        return [
            'data' => $data,
            'customerAddressId' => $this->getRequest()->getPost($address_id, false),
        ];
    }

    protected function mapPaymentOptions() {
        return [
            'method' => $this->getRequest()->getPost('paymentOption'),
        ];
    }
}