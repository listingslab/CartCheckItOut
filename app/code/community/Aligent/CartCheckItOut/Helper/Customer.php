<?php
/**
 * Aligent_CartCheckItOut
 *
 * @category   Aligent
 * @package    cartcheckitout
 * @copyright  Copyright (c) 2017 Aligent
 * @author     Chris Dorward <chris.dorward@aligent.com.au>
 *
 * app/code/community/Aligent/CheckItOut/Helper/Data.php
 * Helper functions for cart & checkout
 *
 */

class Aligent_CartCheckItOut_Helper_Customer extends Aligent_CartCheckItOut_Helper_Base
{
    const XML_VARNISHCACHE_ENABLED_PATH = 'aligent_cartcheckitout/settings/varnishcache_enabled';

    protected $_flatShipping = null;
    protected $_flatBilling = null;
    protected $_addressUpdated = false;
    protected $_user = null;

    // To avoid null retrying.
    protected $_customerDefaultShipping = '';
    protected $_customerDefaultBilling = '';

    /**
     * Check the quote for a country, if not found, try the customers default shipping.
     * If no country can be found, use the stores default.
     *
     * @return string
     */
    public function getShippingCountry(){
        list($shipping, $billing) = $this->getCustomerDetails($this->_getCustomer());

        if (isset ($shipping['country'])) {
            return $shipping['country'];
        } else {
            return $this->getStoreDefaultCountry();
        }
    }

    /**
     * Check the quote for a country, if not found, try the customers default billing.
     * If no country can be found, use the stores default.
     *
     * @return string
     */
    public function getBillingCountry(){
        list($shipping, $billing) = $this->getCustomerDetails($this->_getCustomer());

        if (isset ($billing['country'])) {
            return $billing['country'];
        } else {
            return $this->getStoreDefaultCountry();
        }
    }

    public function updateAccountName($email, $firstname, $lastname) {
        $user = Mage::getModel("customer/customer")->loadByEmail($email);

        if ($user->getId()) {
            if($user->getFirstname() == '' && $user->getLastname() == '') {
                $user->setFirstname($firstname)->setLastname($lastname)->save();
            }
        }
    }

    public function sendForgotPassword($email) {
        if (!Zend_Validate::is($email, 'EmailAddress')) {
            Mage::throwException($this->__('Invalid email address.'));
        }

        $customer = $this->getCustomerByEmail($email);

        if ($customer->getId()) {
            $newResetPasswordLinkToken =  Mage::helper('customer')->generateResetPasswordLinkToken();
            $customer->changeResetPasswordLinkToken($newResetPasswordLinkToken);
            $customer->sendPasswordResetConfirmationEmail();

            // the above will throw an exception if it fails and should be caught.
        }
    }

    public function createAccount($email, $password){
        $websiteId = Mage::app()->getWebsite()->getId();
        $store = Mage::app()->getStore();
        $customer = Mage::getModel("customer/customer");
        $customer
            ->setWebsiteId($websiteId)
            ->setStore($store)
            ->setEmail($email)
            ->setFirstname('')
            ->setLastname('')
            ->setPassword($password);
        try{
            $customer->save();
            // Do not log the customer in as the account is not fully created yet.
            //$this->login($email, $password);

            return true;
        }
        catch (Exception $e) {
            return $e->getMessage();
        }
    }

    protected function getCustomerByEmail($email) {
        if ($this->_user === null) {
            $this->_user = Mage::getModel("customer/customer")->loadByEmail($email);
        }
        return $this->_user;
    }

    public function checkEmailExists ($email){
        if ($this->getCustomerByEmail($email)->getId()) {
            return true;
        }
        return false;
    }

    public function checkIsNewCustomerByEmail($email){
        $user = $this->getCustomerByEmail($email);
        if ($user->getFirstname() == '' || $user->getLastname() == '') {
            return true;
        }
        return false;
    }

    protected function getPreviousQuote($email) {
        if($this->checkEmailExists($email)) {
            return Mage::getModel('sales/quote')->loadByCustomer($this->getCustomerByEmail($email));
        }
        return null;
    }

    public function getPreviousCart($email) {
        if (($quote = $this->getPreviousQuote($email)) !== null){
            return $quote->getAllVisibleItems();
        }
        return array();
    }

    public function removePreviousCart($email) {
        if (($quote = $this->getPreviousQuote($email)) !== null) {
            if ($quote->getId()) {
                $quote->removeAllItems()->save();
            }
        }
    }

    public function isLoggedIn() {
        return $this->_getCustomerSession()->isLoggedIn();
    }

    // Check details but do not login.
    public function authenticate($username, $password) {
        $customer = Mage::getModel('customer/customer')
            ->setWebsiteId(Mage::app()->getStore()->getWebsiteId());

        try {
            $customer->authenticate($username, $password);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function login($email, $password) {
        if(!$this->isLoggedIn()) {
            $this->_getCustomerSession()->login($email, $password);
            $this->_getCustomerSession()->setCustomerAsLoggedIn($this->_getCustomer());

            // Add the customer to the quote.
            $this->addCustomerToQuote($email);

            // The above only registers for update personalisation cookie it does not actually update it.
            // Therefore we need to trigger update if varnishcache is enabled.
            if (Mage::getStoreConfigFlag($this::XML_VARNISHCACHE_ENABLED_PATH)) {
                Mage::getSingleton('varnishcache/personalisationcookie')->setPersonalisationCookie();
            }
        }
        return $this->_getCustomer();
    }

    /**
     * If we have a customer add them to the quote, otherwise assign guest checkout.
     *
     * @param $email
     */
    public function addCustomerToQuote($email) {
        if ($this->_getCustomer()->getId() !== null) {
            $this->_getQuote()
                ->assignCustomer($this->_getCustomer())
                ->save();
        } else {
            $this->_getQuote()
                ->setCustomerId(null)
                ->setCustomerEmail($email)
                ->setCustomerIsGuest(true)
                ->setCustomerGroupId(Mage_Customer_Model_Group::NOT_LOGGED_IN_ID)
                ->save();
        }
    }

    public function isGuestSet() {
        return $this->_getQuote()->getCustomerIsGuest();
    }

    /**
     * return an array containing the required address information for the checkout.
     * The address info is first grabbed from the quote, if not set grab it from the customer.
     *
     * @param null $customer
     * @return array
     */
    public function getCustomerDetails($customer=null) {
        if ($this->_flatShipping === null) {
            $this->_flatShipping = $this->getAddress($this->_getQuote()->getShippingAddress(), $this->getCustomerDefaultShipping());
            $this->_flatBilling = $this->getAddress($this->_getQuote()->getBillingAddress(), $this->getCustomerDefaultBilling());

            $this->_flatShipping = $this->checkAtl($this->_flatShipping);
        }

        return [
            $this->_flatShipping,
            $this->_flatBilling
        ];
    }

    protected function checkAtl($billingAddress) {
        if (($note = Mage::helper('aligent_cartcheckitout/quote')->getAtlNote()) !== null) {
            $billingAddress['atl'] = $note->getAuthorityToLeave();
            $billingAddress['atl_instructions'] = $note->getDeliveryInstructions();
        } else {
            $billingAddress['atl'] = 0;
            $billingAddress['atl_instructions'] = '';
        }

        return $billingAddress;
    }

    public function getLoggedInEmail() {
        return trim($this->_getCustomer()->getEmail());
    }

    /**
     * Get the cached customers default shipping address.
     *
     * @return Mage_Core_Model_Abstract|null|string
     */
    public function getCustomerDefaultShipping() {
        if ($this->_customerDefaultShipping === '') {
            $customerShippingAddressId = $this->_getCustomer()->getDefaultShipping();

            if ($customerShippingAddressId) {
                $this->_customerDefaultShipping = Mage::getModel('customer/address')->load($customerShippingAddressId);
            } else {
                $this->_customerDefaultShipping = null;
            }
        }
        return $this->_customerDefaultShipping;
    }

    /**
     * Get the cached customers default billing address.
     *
     * @return Mage_Core_Model_Abstract|null|string
     */
    public function getCustomerDefaultBilling() {
        if ($this->_customerDefaultBilling === '') {
            $customerBillingAddressId = $this->_getCustomer()->getDefaultBilling();

            if ($customerBillingAddressId) {
                $this->_customerDefaultBilling = Mage::getModel('customer/address')->load($customerBillingAddressId);
            } else {
                $this->_customerDefaultBilling = null;
            }
        }
        return $this->_customerDefaultBilling;
    }

    /**
     * Get a clean array of information to send to the checkout.
     * It should contain the address information from the quote, if this is not available use the customer default.
     *
     * @param null $quoteAddress
     * @param null $customerAddress
     * @return array
     */
    protected function getAddress($quoteAddress=null, $customerAddress=null) {
        $address = array();

        $address['firstname'] = $this->getAddressInfoFromQuoteOrCustomer('firstname', $quoteAddress, $customerAddress);
        $address['lastname'] = $this->getAddressInfoFromQuoteOrCustomer('lastname', $quoteAddress, $customerAddress);
        $address['email'] = $this->getAddressInfoFromQuoteOrCustomer('email', $quoteAddress, $customerAddress);
        $address['company'] = $this->getAddressInfoFromQuoteOrCustomer('company', $quoteAddress, $customerAddress);
        $address['zip'] = $this->getAddressInfoFromQuoteOrCustomer('postcode', $quoteAddress, $customerAddress);
        $address['city'] = $this->getAddressInfoFromQuoteOrCustomer('city', $quoteAddress, $customerAddress);
        $address['Street'] = array($this->getAddressInfoFromQuoteOrCustomer('street', $quoteAddress, $customerAddress));
        $address['telephone'] = $this->getAddressInfoFromQuoteOrCustomer('telephone', $quoteAddress, $customerAddress);
        $address['region'] = $this->getAddressInfoFromQuoteOrCustomer('region', $quoteAddress, $customerAddress);
        $address['region_id'] = $this->getAddressInfoFromQuoteOrCustomer('region_id', $quoteAddress, $customerAddress);
        $address['country'] = $this->getAddressInfoFromQuoteOrCustomer('country_id', $quoteAddress, $customerAddress);

        if ($address['firstname'] === null) {
            $address['firstname'] = $this->_getCustomer()->getFirstname();
        }
        if ($address['lastname'] === null) {
            $address['lastname'] = $this->_getCustomer()->getLastname();
        }
        if ($address['email'] === null) {
            $address['email'] = $this->_getCustomer()->getEmail();
        }

        //address was updated during previous step. Save quote.
        if ($this->_addressUpdated) {
            $quoteAddress->save();
            $this->_addressUpdated = false;
        }

        return $address;
    }

    /**
     * Check the quote and then the customer for the address item.
     * Assign the item to the quote if found on the customer and not in the quote.
     *
     * @param $addressLine
     * @param null $quoteAddress
     * @param null $customerAddress
     * @return null
     */
    protected function getAddressInfoFromQuoteOrCustomer($addressLine, $quoteAddress=null, $customerAddress=null) {
        if ($quoteAddress !== null) {
            $lineItem = $quoteAddress->getData($addressLine);

            if($lineItem !== null) {
                return $lineItem;
            }
        }

        if ($customerAddress !== null) {
            $lineItem = $customerAddress->getData($addressLine);

            if($lineItem !== null) {
                $quoteAddress->setData($lineItem);
                $this->_addressUpdated = true;

                return $lineItem;
            }
        }

        return null;
    }
}
