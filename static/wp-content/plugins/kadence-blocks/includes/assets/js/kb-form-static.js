/* Static replacement for kb-form-block.min.js (Kadence Blocks 3.6.7).
 * Identical validation, spinner, and message rendering; the only change is
 * the transport: instead of WP admin-ajax.php, submissions go to the
 * FormSubmit AJAX endpoint. Success/error texts mirror the WP form config.
 */
(function () {
	'use strict';
	/* FormSubmit endpoint. The destination is the site's public contact
	 * email (already displayed on /contact/). Requires one-time activation
	 * per domain via the link FormSubmit emails on first use. */
	var ENDPOINT = 'https://formsubmit.co/ajax/arhitect.stefaniapana@gmail.com';
	var SUBJECT = 'Mesaj nou de pe stefaniapana.design';
	var SUCCESS_MESSAGE = 'Mulțumesc pentru mesaj! Revin cât de curând pe e-mail';
	var ERROR_MESSAGE = 'Îmi pare rău, ceva nu a mers.';

	window.kadenceForm = {
		error_item: 1,
		clearForm(form) { form.reset(); },
		insertAfter(newNode, referenceNode) {
			referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
		},
		markError(item, error_type, form) {
			let error_string = '';
			if (form.classList.contains('kb-form-has-error') || form.classList.add('kb-form-has-error'), item.classList.add('has-error'), error_type) {
				if (error_type === 'required') {
					error_string = item.getAttribute('data-required-message');
					if (!error_string || '' === error_string) {
						error_string = item.getAttribute('data-label');
						if (!error_string || '' === error_string) { error_string = kadence_blocks_form_params.item; }
						error_string = error_string + ' ' + kadence_blocks_form_params[error_type];
					}
				} else if (error_type === 'validation') {
					error_string = item.getAttribute('data-validation-message');
					if (!error_string || '' === error_string) {
						error_string = item.getAttribute('data-label');
						if (!error_string || '' === error_string) { error_string = kadence_blocks_form_params.item; }
						error_string = error_string + ' ' + kadence_blocks_form_params[error_type];
					}
				}
				const old_error = item.parentNode.querySelector('.kb-form-error-msg');
				if (old_error) { old_error.remove(); }
				const error_id = item.getAttribute('name') + '-error';
				item.setAttribute('aria-describedby', error_id);
				item.setAttribute('aria-invalid', 'true');
				const el = document.createElement('div');
				el.id = error_id;
				el.classList.add('kb-form-error-msg');
				el.classList.add('kadence-blocks-form-warning');
				el.setAttribute('role', 'alert');
				el.innerHTML = window.kadenceForm.strip_tags(error_string, '<div><a><b><i><u><p><ol><ul>');
				if (item.classList.contains('kb-checkbox-style')) { item.parentNode.append(el); }
				else { window.kadenceForm.insertAfter(el, item); }
			}
			if (1 === window.kadenceForm.error_item) { item.focus(); }
			window.kadenceForm.error_item++;
		},
		strip_tags(input, allowed) {
			allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
			return input.replace(/<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi, '').replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, function (a, b) {
				return -1 < allowed.indexOf('<' + b.toLowerCase() + '>') ? a : '';
			});
		},
		addNotice(form, message, type) {
			const el = document.createElement('div');
			el.classList.add('kadence-blocks-form-message');
			el.classList.add(type === 'success' ? 'kadence-blocks-form-success' : 'kadence-blocks-form-warning');
			el.innerHTML = window.kadenceForm.strip_tags(message, '<div><a><b><i><u><p><ol><ul>');
			window.kadenceForm.insertAfter(el, form);
		},
		addErrorNotice(form) {
			let message = form.getAttribute('data-error-message');
			if (!message || '' === message) { message = kadence_blocks_form_params.error_message; }
			window.kadenceForm.addNotice(form, message, 'warning');
		},
		isValidEmail(email) {
			return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
		},
		removeErrors(item) {
			if (item.classList.contains('kb-form-has-error')) { item.classList.remove('kb-form-has-error'); }
			const has_error = item.querySelectorAll('.has-error');
			for (var n = 0; n < has_error.length; n++) {
				has_error[n].classList.remove('has-error');
				has_error[n].removeAttribute('aria-describedby');
				has_error[n].removeAttribute('aria-invalid');
				const el = has_error[n].parentNode.querySelector('.kb-form-error-msg');
				if (el) { el.remove(); }
			}
			const notices = document.querySelectorAll('.kadence-blocks-form-message');
			for (var n = 0; n < notices.length; n++) { notices[n].remove(); }
		},
		validateForm(form) {
			let error = false;
			window.kadenceForm.removeErrors(form);
			const required = form.querySelectorAll('[data-required="yes"]');
			for (let n = 0; n < required.length; n++) {
				var type = required[n].getAttribute('data-type');
				var val = '';
				switch (type) {
					case 'textarea':
					case 'text':
					case 'tel':
						val = required[n].value.trim();
						if ('' === val) { error = true; window.kadenceForm.markError(required[n], 'required', form); }
						break;
					case 'email':
						val = required[n].value.trim();
						if ('' === val) { error = true; window.kadenceForm.markError(required[n], 'required', form); }
						else if (!window.kadenceForm.isValidEmail(val)) { error = true; window.kadenceForm.markError(required[n], 'validation', form); }
						break;
				}
			}
			if (error) { window.kadenceForm.addErrorNotice(form); return false; }
			return true;
		},
		payload(form) {
			const data = { _subject: SUBJECT, _template: 'table' };
			const fields = form.querySelectorAll('input[name^="kb_field"], textarea[name^="kb_field"], select[name^="kb_field"]');
			for (let n = 0; n < fields.length; n++) {
				const label = fields[n].getAttribute('data-label') || fields[n].getAttribute('name');
				data[label] = fields[n].value;
			}
			return data;
		},
		submit(e, form) {
			e.preventDefault();
			const event = new Event('kb-form-start-submit');
			window.document.body.dispatchEvent(event);
			const submitButton = form.querySelector('.kb-forms-submit');
			if (!window.kadenceForm.validateForm(form)) { return; }
			if (!ENDPOINT) { window.kadenceForm.addNotice(form, ERROR_MESSAGE, 'warning'); return; }
			// Honeypot: silently succeed without sending.
			const honeypot = form.querySelector('input[name="_kb_verify_email"]');
			if (honeypot && honeypot.value.trim() !== '') {
				window.kadenceForm.addNotice(form, SUCCESS_MESSAGE, 'success');
				window.kadenceForm.clearForm(form);
				return;
			}
			const spinner = document.createElement('div');
			spinner.classList.add('kb-form-loading');
			spinner.innerHTML = '<div class="kb-form-loading-spin"><div></div><div></div><div></div><div></div></div>';
			form.append(spinner);
			submitButton.setAttribute('disabled', 'disabled');
			submitButton.classList.add('button-primary-disabled');
			const request = new XMLHttpRequest();
			request.open('POST', ENDPOINT, true);
			request.setRequestHeader('Content-Type', 'application/json');
			request.setRequestHeader('Accept', 'application/json');
			request.onload = function () {
				let ok = this.status >= 200 && this.status < 400;
				if (ok) {
					try {
						const res = JSON.parse(this.response);
						if (res && (res.success === 'false' || res.success === false)) { ok = false; }
					} catch (err) { /* non-JSON response: keep HTTP status verdict */ }
				}
				if (ok) {
					const successEvent = new CustomEvent('kb-form-success', {
						detail: form.querySelector('input[name="_kb_form_id"]') ? form.querySelector('input[name="_kb_form_id"]').value : '',
					});
					window.document.body.dispatchEvent(successEvent);
					window.kadenceForm.addNotice(form, SUCCESS_MESSAGE, 'success');
					window.kadenceForm.clearForm(form);
				} else {
					window.kadenceForm.addNotice(form, ERROR_MESSAGE, 'warning');
				}
				submitButton.removeAttribute('disabled');
				submitButton.classList.remove('button-primary-disabled');
				form.querySelector('.kb-form-loading').remove();
			};
			request.onerror = function () {
				window.kadenceForm.addNotice(form, ERROR_MESSAGE, 'warning');
				submitButton.removeAttribute('disabled');
				submitButton.classList.remove('button-primary-disabled');
				form.querySelector('.kb-form-loading').remove();
			};
			request.send(JSON.stringify(window.kadenceForm.payload(form)));
		},
		addAriaRequired(form) {
			const fields = form.querySelectorAll('input, select, textarea');
			for (let n = 0; n < fields.length; n++) {
				const field = fields[n];
				if (field.dataset && field.dataset.required && field.getAttribute('type') !== 'hidden') {
					field.setAttribute('aria-required', 'true');
				}
			}
		},
		initForms() {
			const forms = document.querySelectorAll('form.kb-form');
			if (forms.length) {
				const handler = function (form) { return function (e) { window.kadenceForm.submit(e, form); }; };
				for (let n = 0; n < forms.length; n++) {
					window.kadenceForm.addAriaRequired(forms[n]);
					forms[n].addEventListener('submit', handler(forms[n]));
				}
			}
		},
		init() {
			if (typeof kadence_blocks_form_params !== 'undefined') { window.kadenceForm.initForms(); }
		},
	};
	if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', window.kadenceForm.init); }
	else { window.kadenceForm.init(); }
})();
