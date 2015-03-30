(function() {

  return {
    events: {
      'app.activated': 'getDates',
      'ticket.custom_field_22861220': 'getDates', // Maximum Delivery Days
      'ticket.form.id.changed': 'getDates',
      'ticket.tags.changed': 'getDates',
      '*.changed': 'getDates'
    },

    getDates: function() {
      var ticket = this.ticket();

      if (ticket.customField("custom_field_" + this.setting('issues_by_vertical_field')) === 'vertical_product') { // Issues by Vertical
        if ((ticket.customField("custom_field_" + this.setting('max_delivery_days_field')) === null) || (ticket.customField("custom_field_" + this.setting('voucher_purchase_date_field')) === null)) {
          this.switchTo('error_dates'); // Error: Maximum Delivery Days or Voucher Purchase Date is blank
        } else {
          var purchaseDate = new Date(ticket.customField("custom_field_" + this.setting('voucher_purchase_date_field'))); // Voucher Purchase Date
          var maxDelivery = ticket.customField("custom_field_" + this.setting('max_delivery_days_field')); // Maximum Delivery Days
          var date = new Date();
          var difference = new Date(date - purchaseDate);
          var differencedays = difference / 1000 / 60 / 60 / 24;
          var totaldays = maxDelivery - differencedays.toFixed(0);
          console.log(maxDelivery);
          if (totaldays >= 0) {
            this.switchTo('inside_delivery', {
              totaldays: totaldays,
              maxDelivery: maxDelivery,
              purchaseDate: purchaseDate
            });
          } else {
            this.switchTo('outside_delivery', {
              totaldays: totaldays,
              maxDelivery: maxDelivery,
              purchaseDate: purchaseDate

            });
          }

        }
      }
      else {

        if ((ticket.customField("custom_field_" + this.setting('expiry_field')) === null) || (ticket.customField("custom_field_" + this.setting('voucher_purchase_date_field')) === null)) {
          this.switchTo('error_dates'); // Error: Voucher Expiry Date or Voucher Purchase Date is blank
        } else {

          var expiry = new Date(ticket.customField("custom_field_" + this.setting('expiry_field'))); // Voucher Expiry Date
          var startDate = new Date(ticket.customField("custom_field_" + this.setting('voucher_purchase_date_field'))); // Voucher Purchase Date
          var endDate = new Date(); // Today's Date

          //Script to calculate the number of business days between purchase and today's date
          // Calculate days between dates
          var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
          startDate.setHours(0, 0, 0, 1); // Start just after midnight
          endDate.setHours(23, 59, 59, 999); // End just before midnight
          var diff = endDate - startDate; // Milliseconds between datetime objects
          var days = Math.ceil(diff / millisecondsPerDay);

          // Subtract two weekend days for every week in between
          var weeks = Math.floor(days / 7);
          days = days - (weeks * 2);

          // Handle special cases
          var startDay = startDate.getDay();
          var endDay = endDate.getDay();

          // Remove weekend not previously removed.
          if (startDay - endDay > 1)
            days = days - 2;

          // Remove start day if span starts on Sunday but ends before Saturday
          if (startDay === 0 && endDay !== 6)
            days = days - 1;

          // Remove end day if span ends on Saturday but starts after Sunday
          if (endDay === 6 && startDay !== 0)
            days = days - 1;

          //Script to calculate the difference between expiry date and today
          var expdifference = new Date(expiry - endDate);
          var expdifferencedays = expdifference / 1000 / 60 / 60 / 24;
          var totalexpdays = expdifferencedays.toFixed(0);

          if (days <= 7 && totalexpdays >= 0) { // inside withdrawal period and valid voucher
            this.switchTo('inside_withdrawal_period_valid', {
              days: days,
              totalexpdays: totalexpdays
            });
          } else if (days <= 7 && totalexpdays < 0) { // inside withdrawal period and expired voucher
            this.switchTo('inside_withdrawal_period_expired', {
              days: days,
              totalexpdays: totalexpdays
            });
          } else if (days > 7 && totalexpdays < 0) { // outside withdrawal period and expired voucher
            this.switchTo('outside_withdrawal_period_expired', {
              days: days,
              totalexpdays: totalexpdays
            });
          } else if (days > 7 && totalexpdays >= 0) { // outside withdrawal period and valid voucher
            this.switchTo('outside_withdrawal_period_valid', {
              days: days,
              totalexpdays: totalexpdays
            });
          }
        }

      }
    },
  };
}());
