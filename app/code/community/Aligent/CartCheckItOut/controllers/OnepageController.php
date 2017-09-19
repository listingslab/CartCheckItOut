<?php

require_once 'Mage/Checkout/controllers/OnepageController.php';

Class Aligent_CartCheckItOut_OnepageController extends Mage_Checkout_OnepageController {

    /**
     * Override the default to allow for firstname and lastname of one space to interact with the checkout.
     */
    protected function _preDispatchValidateCustomer($redirect = true, $addErrors = true)
    {
        // Do not check for firstname/lastname validation of customer as they may have just registered without one.
        if (Mage::helper('aligent_cartcheckitout')->isEnabled()) {
            $customer = Mage::getSingleton('customer/session')->getCustomer();
            if ($customer && $customer->getId()) {
                $validationResult = $customer->validate();
                if ((true !== $validationResult) && is_array($validationResult)) {
                    // The user may have just been created without a firstname and lastname. give them a chance to edit it.
                    if (count($validationResult) == 2 && $customer->getFirstname() == '' && $customer->getLastname() == '') {
                        return true;
                    }
                    if ($addErrors) {
                        foreach ($validationResult as $error) {
                            Mage::getSingleton('customer/session')->addError($error);
                        }
                    }
                    if ($redirect) {
                        $this->_redirect('customer/account/edit');
                        $this->setFlag('', self::FLAG_NO_DISPATCH, true);
                    }
                    return false;
                }
            }
            return true;
        }
        return parent::_preDispatchValidateCustomer($redirect, $addErrors);
    }

    /**
     * Create order action
     */
    public function saveOrderAction()
    {
        if (!$this->_validateFormKey()) {
            $this->_redirect('*/*');
            return;
        }

        if ($this->_expireAjax()) {
            return;
        }

        parent::saveOrderAction();

        // Check if we saved the order and are not redirecting anywhere, save the quote as inactive.
        $response = Mage::helper('core')->jsonDecode($this->getResponse()->getBody());

        if ($response['success'] == true && !isset($response['redirect'])) {
            $this->getOnepage()->getQuote()->setIsActive(false);
            $this->getOnepage()->getQuote()->save();
            $redirect = Mage::getUrl('checkout/onepage/success');

            $response['redirect'] = $redirect;

            $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
        }
    }
}
