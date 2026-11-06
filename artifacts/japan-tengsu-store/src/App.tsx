import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCreateOrderInquiry } from '@workspace/api-client-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';

const queryClient = new QueryClient();
const packSizes = [1, 2, 3, 5, 10];
const unitPrice = 30;
const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);

type InquiryFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

function OrderInquiryForm({
  bottleCount,
  total,
}: {
  bottleCount: number;
  total: number;
}) {
  const mutation = useCreateOrderInquiry();
  const form = useForm<InquiryFormValues>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      message: '',
      consent: false,
    },
  });
  const [status, setStatus] = useState('');

  const submitInquiry = (values: InquiryFormValues) => {
    setStatus('');
    mutation.mutate(
      {
        data: {
          bottleCount,
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim() || undefined,
          message: values.message.trim() || undefined,
          consent: values.consent,
        },
      },
      {
        onSuccess: () => {
          form.reset();
          setStatus('Your request was emailed to the store. This is an inquiry, not a confirmed order.');
        },
        onError: () => {
          setStatus('We could not send your request. Please try again in a little while.');
        },
      },
    );
  };

  return (
    <section className="inquiry-panel" id="order-request" aria-labelledby="inquiry-title">
      <div className="inquiry-copy">
        <span className="section-index">02 / Contact to order</span>
        <h3 id="inquiry-title">Send an order request.</h3>
        <p>
          Share the best way to reach you. Your selected quantity and subtotal will be included in an email to the store.
          Sending this form does not confirm an order or take payment.
        </p>
        <div className="request-summary" aria-live="polite" data-testid="text-inquiry-summary">
          <span>{bottleCount} {bottleCount === 1 ? 'bottle' : 'bottles'} · USD $30 each</span>
          <strong>{formatPrice(total)} USD</strong>
        </div>
        <p className="inquiry-fine-print">Delivery costs, if any, are not included. The store will reply to the email address you provide.</p>
      </div>

      <div className="inquiry-form-wrap">
        <Form {...form}>
          <form className="inquiry-form" onSubmit={form.handleSubmit(submitInquiry)} noValidate>
            <div className="form-fields">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: 'Enter your name.', maxLength: { value: 100, message: 'Use 100 characters or fewer.' } }}
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel>Your name</FormLabel>
                    <FormControl>
                      <Input autoComplete="name" maxLength={100} data-testid="input-customer-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: 'Enter your email address.',
                  maxLength: { value: 254, message: 'Use 254 characters or fewer.' },
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address.' },
                }}
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="email" maxLength={254} data-testid="input-customer-email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                rules={{ maxLength: { value: 40, message: 'Use 40 characters or fewer.' } }}
                render={({ field }) => (
                  <FormItem className="form-field">
                    <FormLabel>Phone or WhatsApp <span className="optional-label">Optional</span></FormLabel>
                    <FormControl>
                      <Input type="tel" autoComplete="tel" maxLength={40} data-testid="input-customer-phone" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                rules={{ maxLength: { value: 500, message: 'Use 500 characters or fewer.' } }}
                render={({ field }) => (
                  <FormItem className="form-field form-field-wide">
                    <FormLabel>Message <span className="optional-label">Optional</span></FormLabel>
                    <FormControl>
                      <Textarea rows={3} maxLength={500} data-testid="input-customer-message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="consent"
              rules={{ validate: (value) => value || 'Please agree before sending your request.' }}
              render={({ field }) => (
                <FormItem className="consent-field">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-order-consent"
                    />
                  </FormControl>
                  <div>
                    <FormLabel className="consent-label">I agree to email my contact details and request to the store so it can reply.</FormLabel>
                    <FormDescription>The site does not keep a separate order record. The request is sent to the store by email.</FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <button className="submit-inquiry" type="submit" disabled={mutation.isPending} data-testid="button-submit-inquiry">
              {mutation.isPending ? 'Sending request…' : 'Send order request'}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
            <p className="inquiry-status" role="status" aria-live="polite" data-testid="status-inquiry">
              {status}
            </p>
          </form>
        </Form>
      </div>
    </section>
  );
}

function Home() {
  const [selectedPack, setSelectedPack] = useState(1);
  const [cartUnits, setCartUnits] = useState(0);
  const [cartMessage, setCartMessage] = useState('');
  const requestQuantity = cartUnits > 0 ? cartUnits : selectedPack;
  const cartTotal = cartUnits * unitPrice;
  const requestTotal = requestQuantity * unitPrice;

  useEffect(() => {
    const configuredSiteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '');
    if (!configuredSiteUrl) {
      document.querySelector('link[rel="canonical"]')?.remove();
      document.querySelector('meta[property="og:url"]')?.remove();
      document.querySelector('meta[property="og:image"]')?.remove();
      document.querySelector('meta[name="twitter:image"]')?.remove();
      return;
    }
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.append(canonical);
    }
    canonical.href = `${configuredSiteUrl}/`;
    let ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.append(ogUrl);
    }
    ogUrl.content = `${configuredSiteUrl}/`;
    const ogImage = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
    if (ogImage) ogImage.content = `${configuredSiteUrl}/images/japan-tengsu-product.jpeg`;
    const twitterImage = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.content = `${configuredSiteUrl}/images/japan-tengsu-product.jpeg`;
  }, []);

  const addToCart = () => {
    if (cartUnits + selectedPack > 50) {
      setCartMessage('A request can include up to 50 bottles.');
      return;
    }
    setCartUnits((current) => current + selectedPack);
    setCartMessage(`${selectedPack} ${selectedPack === 1 ? 'bottle' : 'bottles'} added to your selection.`);
  };

  const clearCart = () => {
    setCartUnits(0);
    setCartMessage('Your selection has been cleared.');
  };

  const focusOrder = () => {
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Japan Tengsu, home" data-testid="link-home">
          <span className="mark" aria-hidden="true">日</span>
          <span className="brand-name">Japan Tengsu</span>
        </a>
        <nav className="header-links" aria-label="Main navigation">
          <a href="#product" data-testid="link-product-info">Product notes</a>
          <a href="#questions" data-testid="link-faq">Questions</a>
          <button className="cart-link" type="button" onClick={focusOrder} aria-label={`Selection, ${cartUnits} bottles`} data-testid="button-view-selection">
            <ShoppingBag size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>Selection</span>
            <span className="cart-count" data-testid="text-cart-count">{cartUnits}</span>
          </button>
        </nav>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="page-title">
          <div className="hero-copy">
            <div className="eyebrow">Product record / 01</div>
            <h1 id="page-title">Japan<br /><em>Tengsu</em></h1>
            <p className="hero-lede">
              A considered product page for the item shown. Review the package image and the information we can verify before choosing a pack size.
            </p>
            <div className="hero-meta" aria-label="Product information at a glance">
              <span><i className="meta-dot" aria-hidden="true" /> Bottle format</span>
              <span><i className="meta-dot" aria-hidden="true" /> Pack sizes 1–10</span>
            </div>
            <a className="primary-link" href="#order" data-testid="link-choose-pack">
              Choose a pack <ArrowDownRight size={16} aria-hidden="true" />
            </a>
          </div>
          <figure className="hero-visual">
            <span className="vertical-index" aria-hidden="true">PACKAGING / FRONT VIEW</span>
            <span className="visual-halo" aria-hidden="true" />
            <img
              className="product-photo"
              src="/images/japan-tengsu-product.jpeg"
              alt="Japan Tengsu bottle beside its printed carton; the visible package includes the name JAPAN TENGSU and the text 0.5g / Tablet."
              width="478"
              height="382"
              fetchPriority="high"
              data-testid="img-japan-tengsu-product"
            />
            <figcaption className="image-caption">Package shown as supplied. Printed details may require confirmation.</figcaption>
          </figure>
        </section>

        <aside className="note-band" aria-label="Information note">
          <div className="note-band-inner">
            <span className="band-label">A note on accuracy</span>
            <p className="band-copy">The photo is a reference—not a substitute for a complete, legible product label.</p>
            <span className="band-mark" aria-hidden="true">—</span>
          </div>
        </aside>

        <section className="content-section" id="order" aria-labelledby="order-title">
          <div className="section-heading">
            <span className="section-index">01 / Select quantity</span>
            <div>
              <h2 id="order-title">Choose your<br />pack size.</h2>
              <p className="section-intro">Select a pack to see its total, then send an order request by email. The request is not a confirmed order, and this page does not take payment.</p>
            </div>
          </div>
          <div className="purchase-grid">
            <div className="purchase-main">
              <span className="field-label" id="pack-size-label">Number of bottles <span className="field-note">Choose one option</span></span>
              <div className="pack-options" role="group" aria-labelledby="pack-size-label" data-testid="group-pack-sizes">
                {packSizes.map((size) => (
                  <button
                    className="pack-option"
                    type="button"
                    key={size}
                    aria-pressed={selectedPack === size}
                    onClick={() => {
                      setSelectedPack(size);
                      setCartMessage('');
                    }}
                    data-testid={`button-pack-${size}`}
                  >
                    <span className="pack-number">{size}</span>
                    <span className="pack-unit">{size === 1 ? 'bottle' : 'bottles'}</span>
                  </button>
                ))}
              </div>
            </div>
            <aside className="selection-card" aria-label="Current selection">
              <div className="selection-top">
                <span className="selection-title">Your selection</span>
                <span className="selection-unit" data-testid="text-selected-pack">{selectedPack} {selectedPack === 1 ? 'bottle' : 'bottles'}</span>
              </div>
              <div className="price-note">
                <strong data-testid="text-unit-price">{formatPrice(unitPrice)} USD / bottle</strong>
                <p>Pack total: <strong data-testid="text-pack-total">{formatPrice(selectedPack * unitPrice)} USD</strong>. Delivery costs, if any, are not included.</p>
              </div>
              <button className="add-button" type="button" onClick={addToCart} data-testid="button-add-selection">
                <span>Add to selection</span><ArrowRight size={16} aria-hidden="true" />
              </button>
              <a className="inquiry-shortcut" href="#order-request" data-testid="link-send-order-request">
                Continue to order request <ArrowDownRight size={14} aria-hidden="true" />
              </a>
              <p className="cart-status" role="status" aria-live="polite" data-visible={cartMessage.length > 0} data-testid="status-cart">{cartMessage || (cartUnits > 0 ? `${cartUnits} ${cartUnits === 1 ? 'bottle' : 'bottles'} in your selection — ${formatPrice(cartTotal)} USD.` : 'No bottles selected yet.')}</p>
              {cartUnits > 0 && <p className="cart-status" data-testid="text-cart-total">Selection total: <strong>{formatPrice(cartTotal)} USD</strong></p>}
              {cartUnits > 0 && (
                <button className="clear-selection" type="button" onClick={clearCart} data-testid="button-clear-selection">
                  Clear selection
                </button>
              )}
            </aside>
          </div>
          <OrderInquiryForm bottleCount={requestQuantity} total={requestTotal} />
        </section>

        <section className="details-section" id="product" aria-labelledby="details-title">
          <div className="details-inner">
            <div className="details-layout">
              <div className="details-aside">
                <span className="section-index">03 / Read the label</span>
                <h2 id="details-title">What the photo<br />can—and can’t—tell us.</h2>
                <p className="aside-copy">We’ve kept this record to details visible in the supplied photograph. Anything that cannot be read or independently confirmed is left open rather than guessed.</p>
              </div>
              <div className="fact-list" aria-label="Visible product details">
                <div className="fact-row">
                  <span className="fact-key">Name shown</span>
                  <span className="fact-value">“JAPAN TENGSU” is printed on the carton and bottle label.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Package format</span>
                  <span className="fact-value">One bottle and one carton are pictured. The carton includes the text “0.5g / Tablet”; the photo alone does not establish a full count or serving details.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Ingredients</span>
                  <span className="fact-value">A complete ingredient list is not legible in this image. Please rely on a full package label and verified product documentation.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Origin & maker</span>
                  <span className="fact-value">The bottle label appears to include “MADE IN JAPAN.” This is package wording visible in the photo, not independent verification of origin or place of production; the maker is not confirmed.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Use & safety</span>
                  <span className="fact-value">No directions, suitability, or safety information can be confirmed from this view. Check the complete label and consult an appropriate professional if you have questions.</span>
                </div>
                <div className="fact-row">
                  <span className="fact-key">Product status</span>
                  <span className="fact-value">Price shown is USD $30 per bottle. You can email an order request from this page; it does not process payment or confirm a purchase.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" id="questions" aria-labelledby="faq-title">
          <div className="faq-heading">
                <span className="section-index">04 / Common questions</span>
            <h2 id="faq-title">Clear answers.<br />No guesswork.</h2>
          </div>
          <div className="faq-list">
            <details className="faq-item">
              <summary>What is Japan Tengsu?</summary>
              <div className="faq-answer"><p>Japan Tengsu is the name printed on the product package shown on this page. The available photo does not verify the product’s composition, classification, intended use, or other claims.</p></div>
            </details>
            <details className="faq-item">
              <summary>What ingredients does it contain?</summary>
              <div className="faq-answer"><p>The ingredient panel is not readable in the supplied image. We have not inferred ingredients from the product name or other package wording. Check a complete, legible label and verified documentation before making a decision.</p></div>
            </details>
            <details className="faq-item">
              <summary>What does “0.5g / Tablet” mean on the carton?</summary>
              <div className="faq-answer"><p>That text is visible on the photographed carton. The image does not provide enough context to interpret it as a tablet weight, serving amount, or another specification. Confirm the meaning with the complete product labeling.</p></div>
            </details>
            <details className="faq-item">
              <summary>Where is this product made?</summary>
              <div className="faq-answer"><p>The bottle label appears to say “MADE IN JAPAN.” We can report that visible package wording, but the photograph does not independently verify origin or manufacturing location.</p></div>
            </details>
            <details className="faq-item">
              <summary>Is there safety or usage information?</summary>
              <div className="faq-answer"><p>Directions, warnings, and suitability details are not sufficiently legible in this photograph. Refer to the full original label and seek advice from a qualified professional for questions about use or safety.</p></div>
            </details>
            <details className="faq-item">
              <summary>Can I place or pay for an order here?</summary>
              <div className="faq-answer"><p>You can email an order request using the form. It is not a confirmed order and no payment is taken. The displayed total is based on USD $30 per bottle; delivery costs, if any, are not included.</p></div>
            </details>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="wordmark" href="#top" data-testid="link-footer-home"><span className="mark" aria-hidden="true">日</span><span className="footer-brand">Japan Tengsu</span></a>
        <p className="footer-note">Product details are limited to what is visible in the supplied image. Price is USD $30 per bottle; emailed requests do not confirm a purchase.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ErrorBoundary resetKey="home">
          <Home />
        </ErrorBoundary>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
