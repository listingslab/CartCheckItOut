<?php

class Aligent_CartCheckItOut_Helper_Quote extends Aligent_CartCheckItOut_Helper_Base {

    const XML_INTERNATIONAL_SHIPPING_PATH = 'aligent_cartcheckitout/shipping_methods/international_shippingmethod';
    const XML_NATIONAL_FREE_SHIPPING_PATH = 'aligent_cartcheckitout/shipping_methods/national_free_shippingmethod';
    const XML_NATIONAL_NONFREE_SHIPPING_PATH = 'aligent_cartcheckitout/shipping_methods/national_nonfree_shippingmethod';

    protected $_country = null;

    protected function getOnepage() {
        return Mage::getSingleton('checkout/type_onepage');
    }

    public function getEmail() {
        return $this->_getQuote()->getCustomerEmail();
    }

    protected function updateCustomersNameIfEmpty($data) {
        // Update the customer if they have an empty name and have specified a name.
        $customer = $this->_getCustomer();
        if ($customer->getFirstname() == ' ' || $customer->getLastname() == ' ') {
            $firstname = trim($data['firstname']);
            $lastname = trim($data['lastname']);

            if ($firstname !== '') {
                $customer->setFirstname($firstname);
            }
            if ($lastname !== '') {
                $customer->setLastname($lastname);
            }

            $customer->save();
        }
    }

    public function removeItemFromQuote($itemId) {
        $quoteItem = $this->_getQuote()->getItemById($itemId);

        if ($quoteItem) {
            try {
                $this->_getQuote()->removeItem($itemId);
                $this->_getCart()->save();

                Mage::getSingleton('varnishcache/personalisationcookie')->updatePersonalisationCookie();
            } catch (Exception $e) {
                return false;
            }
        } else {
            return false;
        }
        return true;
    }


    /**
     * Errors can be thrown from this function and must be caught be caller.
     * Function taken from cartController
     *
     * @param $itemId
     * @param $qty
     */
    public function updateQty($itemId, $qty) {
        $cartData = array($itemId => array('qty' => $qty));

        if (is_array($cartData)) {
            $filter = new Zend_Filter_LocalizedToNormalized(
                array('locale' => Mage::app()->getLocale()->getLocaleCode())
            );

            foreach ($cartData as $index => $data) {
                if (isset($data['qty'])) {
                    $cartData[$index]['qty'] = $filter->filter(trim($data['qty']));
                }
            }

            $cart = $this->_getCart();

            if (!$cart->getCustomerSession()->getCustomer()->getId() && $cart->getQuote()->getCustomerId()) {
                $cart->getQuote()->setCustomerId(null);
            }

            $cartData = $cart->suggestItemsQty($cartData);
            $cart->updateItems($cartData)->save();

            $itemInQuote = $this->_getQuote()->getItemById($itemId);

            if ($itemInQuote->getHasError()) {
                Mage::throwException($itemInQuote->getMessage());
            }
        }
        $this->_getCheckoutSession()->setCartWasUpdated(true);
    }


    public function updateQuote($billingData, $shippingData, $atlData, $should_subscribe, $paymentData) {
        //if ship to same billing, then actually use shipping data. and DO not saveShipping as saveBilling will do so.
        if ($billingData['data']['same_as_billing']) {
            $this->updateCustomersNameIfEmpty($shippingData['data']);

            // update billing with shipping info (as checkitout is backwards asking for different billing instead of different shiipping
            //$this->saveBilling($billingData['data'], $billingData['customerAddressId']);
            $shippingData['data']['use_for_shipping'] = true;
            $error = $this->getOnepage()->saveBilling($shippingData['data'], $shippingData['customerAddressId']);
            if (count($error) != 0) {
                return $error['message'];
            }
        } else {
            $this->updateCustomersNameIfEmpty($billingData['data']);

            // update billing
            //$this->saveBilling($billingData['data'], $billingData['customerAddressId']);
            $error = $this->getOnepage()->saveBilling($billingData['data'], $billingData['customerAddressId']);

            if (count($error) != 0) {
                return $error['message'];
            }

            // update shipping
            $error = $this->getOnepage()->saveShipping($shippingData['data'], $shippingData['customerAddressId']);
            //$this->saveShipping($shippingData['data'], $shippingData['customerAddressId']);
            if (count($error) != 0) {
                return $error['message'];
            }
        }

        // Save ATL data
        $this->applyAtl($atlData);

        // Subscribe User
        if ($should_subscribe) {
            $this->subscribe();
        }

        // find default shipping method.
        $error = $this->applyDefaultShippingToQuote();
        if (count($error) != 0) {
            return $error['message'];
        }

        // update payment method if any of the above have changed
        $error = $this->getOnepage()->savePayment($paymentData);

        if (count($error) != 0) {
            return $error['message'];
        }

        // Only do this if shipping method or payment detail was updated.
        $this->_getQuote()->setTotalsCollectedFlag(false);
        $this->_getQuote()->collectTotals();
        $this->_getQuote()->save();

        return array();
    }

    public function getATL() {
        $note = $this->getAtlNote();

        if ($note !== null) {
            return ($note->getAuthorityToLeave() == "1");
        }

        return false;
    }
    public function getATLInstructions() {
        $note = $this->getAtlNote();

        if ($note !== null) {
            return $note->getDeliveryInstructions();
        }

        return '';
    }

    public function isSameAsBilling() {
        return ($this->_getQuote()->getShippingAddress()->getSameAsBilling() == "1");
    }

    public function getAtlNote() {
        if (($shipNoteId = $this->_getQuote()->getShipNote()) !== null) {
            return Mage::getModel('shipnote/note')->load($shipNoteId);
        }
        return null;
    }

    /**
     * Take the note from post and and store it in the current quote.
     *
     * When the quote gets converted we will store the delivery note
     * and assign to the order
     */
    protected function applyAtl($atlData) {
        $shipNote = $atlData['atl_instructions'];
        $shipSignatureRequiredInt = 0;
        $shipAuthorityToLeaveInt = 0;

        if ($atlData['atl']) {
            $shipAuthorityToLeaveInt = 1;
        }

        // Check to see if a note has already been saved for the quote.
        $alreadySaved = false;
        $shipNoteModel = Mage::getModel('shipnote/note');
        if (($shipNoteId = $this->_getQuote()->getShipNote()) !== null) {
            $shipNoteModel = $shipNoteModel->load($shipNoteId);
            $alreadySaved = true;
        }

        // Update the note model.
        $shipNoteId = $shipNoteModel
            ->setDeliveryInstructions($shipNote)
            ->setSignatureRequired($shipSignatureRequiredInt)
            ->setAuthorityToLeave($shipAuthorityToLeaveInt)
            ->save()
            ->getId();

        // If the note is not associated to the quote, add it.
        if (!$alreadySaved) {
            try {
                $this->_getQuote()
                    ->setShipNote($shipNoteId)
                    ->save();
            } catch (Exception $e) {
                Mage::logException($e);
            }
        }
    }

    protected function subscribe() {
        Mage::getModel('newsletter/subscriber')->subscribe($this->_getQuote()->getBillingAddress()->getEmail());
    }

    public function submitQuote() {
        $this->getOnepage()->saveOrder();
    }

    public function checkQuoteForPaymentMethod() {
        try {
            return $this->_getQuote()->getPayment()->getMethodInstance()->getCode();
        } catch (Exception $e) {
            return null;
        }
    }

    public function setPaymentMethod($methodCode) {
        // if we do not change the method instance it is cached to the old one
        // and will not be able to be applied if it is no longer available.
        $instance = Mage::helper('payment')->getMethodInstance($methodCode);
        if ($instance->isAvailable($this->_getQuote())) {
            $instance->setInfoInstance($this->_getQuote()->getPayment());
            $this->_getQuote()->getPayment()->setMethodInstance($instance);
        }

        // Now update the payment method.
        $this->getOnepage()->savePayment(['method'=>$methodCode]);
    }

    public function applyDefaultShippingToQuote($updateTotals = false) {
        // find default shipping method.
        $defaultShippingMethod = $this->getDefaultShippingMethod();
        $shippingMethodChanged = false;

        if($defaultShippingMethod != $this->_getQuote()->getShippingAddress()->getShippingMethod()) {
            $shippingMethodChanged = true;

            $error = $this->getOnepage()->saveShippingMethod($defaultShippingMethod);
            if (count($error) != 0) {
                return $error['message'];
            }

            if ($updateTotals) {
                $this->_getQuote()->setTotalsCollectedFlag(false);
                $this->_getQuote()->collectTotals();
                $this->_getQuote()->save();
            }
        }
        return array();
    }

    public function applyCountryToShipping($countryId) {
        $allowCountries = array_flip(explode(',', (string)Mage::getStoreConfig('general/country/allow')));

        if (isset($allowCountries[$countryId])) {
            $this->_getQuote()->getShippingAddress()->setCountryId($countryId)->save();

            // Update the billing country as well as this is what is used for payment methods.
            if ($this->isSameAsBilling()) {
                $this->_getQuote()->getBillingAddress()->setCountryId($countryId)->save();
            }

            $this->_getCart()->save();
            $this->applyDefaultShippingToQuote(true);
        }
    }

    public function applyCountryToBilling($countryId) {
        $allowCountries = array_flip(explode(',', (string)Mage::getStoreConfig('general/country/allow')));

        if (isset($allowCountries[$countryId])) {
            $this->_getQuote()->getShippingAddress()->setSameAsBilling(false);

            $this->_getQuote()->getBillingAddress()->setCountryId($countryId)->save();
            $this->_getCart()->save();
        }
    }

    /**
     * Set the default country for the customer on the quote. If this cannot be found then use the store default.
     */
    public function setDefaultCountry() {
        $updatedShipping = $this->applyDefaultCountryToAddress($this->_getQuote()->getShippingAddress(), Mage::helper('aligent_cartcheckitout/customer')->getCustomerDefaultShipping());
        $updatedBilling = $this->applyDefaultCountryToAddress($this->_getQuote()->getBillingAddress(), Mage::helper('aligent_cartcheckitout/customer')->getCustomerDefaultBilling());

        //save quote and collect new rates.
        if ($updatedShipping || $updatedBilling) {
            $this->_getCart()->save();
        }
    }

    public function getPaymentMethods() {
        $paymentBlock = Mage::getBlockSingleton('checkout/onepage_payment_methods');
        $methods = $paymentBlock->getMethods();
        $freeMethod = null;

        foreach ($methods as $method) {
            if ($method->getCode() == 'free') {
                $freeMethod = $method;
            }
        }

        if ($freeMethod !== null) {
            $methods = array($freeMethod);
        }
        return $methods;
    }

    /**
     * Apply the default country to the address provided.
     * Always try and find the country from the respective customers default.
     * If this cannot be found use the default country specified by the store.
     *
     * @param $address
     * @param null $customerDefault
     * @return bool
     */
    protected function applyDefaultCountryToAddress($address, $customerDefault=null) {
        if ($address->getCountryId() === null) {
            $country = null;

            if ($customerDefault !== null) {
                $country = $customerDefault->getCountryId();
            }

            if ($country === null) {
                if ($this->_country === null) {
                    //get default country as not set by customer default
                    $this->_country = $this->getStoreDefaultCountry();
                }
                $country = $this->_country;
            }

            $address->setCountryId($country)->save();
            return true;
        }
        return false;
    }

    protected function getDefaultShippingMethod() {
        $totalsHelper = Mage::helper('aligent_cartcheckitout/totals');

        if ($totalsHelper->isFreeShippingPossible()) {
            if ($totalsHelper->hasFreeShipping()) {
                return Mage::getStoreConfig(self::XML_NATIONAL_FREE_SHIPPING_PATH);
            } else {
                return Mage::getStoreConfig(self::XML_NATIONAL_NONFREE_SHIPPING_PATH);
            }
        } else {
            return Mage::getStoreConfig(self::XML_INTERNATIONAL_SHIPPING_PATH);
        }
    }
}