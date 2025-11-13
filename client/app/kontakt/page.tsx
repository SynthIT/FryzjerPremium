'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    acceptTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Symulacja wysyłki formularza
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        acceptTerms: false,
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content">
          <h1 className="page-title">Kontakt</h1>
          <p className="page-subtitle">
            Skontaktuj się z nami - chętnie odpowiemy na Twoje pytania
          </p>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-info-section">
                <h2 className="contact-info-title">Dane kontaktowe</h2>
                <div className="contact-info-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <strong>Email:</strong>
                    <a href="mailto:kontakt@fryzjerpremium.pl">kontakt@fryzjerpremium.pl</a>
                  </div>
                </div>
                <div className="contact-info-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <strong>Telefon:</strong>
                    <a href="tel:+48123456789">+48 123 456 789</a>
                  </div>
                </div>
                <div className="contact-info-item">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <strong>Adres:</strong>
                    <span>ul. Przykładowa 123<br />00-000 Warszawa</span>
                  </div>
                </div>
              </div>

              <div className="contact-info-section">
                <h2 className="contact-info-title">Godziny otwarcia</h2>
                <div className="contact-hours">
                  <div className="contact-hours-item">
                    <span>Poniedziałek - Piątek:</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="contact-hours-item">
                    <span>Sobota:</span>
                    <span>10:00 - 16:00</span>
                  </div>
                  <div className="contact-hours-item">
                    <span>Niedziela:</span>
                    <span>Zamknięte</span>
                  </div>
                </div>
              </div>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              {submitStatus === 'success' && (
                <div className="contact-form-message contact-form-message-success" role="alert">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Dziękujemy! Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="contact-form-message contact-form-message-error" role="alert">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie.
                </div>
              )}

              <div className="contact-form-row">
                <div className="contact-form-field">
                  <label htmlFor="contact-name" className="contact-form-label">
                    Imię i nazwisko *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    placeholder="Jan Kowalski"
                    required
                    aria-required="true"
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-email" className="contact-form-label">
                    Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    placeholder="jan.kowalski@example.com"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              <div className="contact-form-row">
                <div className="contact-form-field">
                  <label htmlFor="contact-phone" className="contact-form-label">
                    Telefon
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    placeholder="+48 123 456 789"
                  />
                </div>

                <div className="contact-form-field">
                  <label htmlFor="contact-subject" className="contact-form-label">
                    Temat *
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="contact-form-input"
                    required
                    aria-required="true"
                  >
                    <option value="">Wybierz temat</option>
                    <option value="general">Pytanie ogólne</option>
                    <option value="order">Zamówienie</option>
                    <option value="product">Pytanie o produkt</option>
                    <option value="support">Wsparcie techniczne</option>
                    <option value="other">Inne</option>
                  </select>
                </div>
              </div>

              <div className="contact-form-field">
                <label htmlFor="contact-message" className="contact-form-label">
                  Wiadomość *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="contact-form-textarea"
                  placeholder="Napisz swoją wiadomość..."
                  rows={6}
                  required
                  aria-required="true"
                />
              </div>

              <div className="contact-form-checkbox-group">
                <label className="contact-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="contact-form-checkbox-input"
                    required
                    aria-required="true"
                  />
                  <span className="contact-form-checkbox-text">
                    Akceptuję <Link href="/regulamin" className="contact-form-checkbox-link" target="_blank">regulamin</Link> oraz{' '}
                    <Link href="/polityka-prywatnosci" className="contact-form-checkbox-link" target="_blank">politykę prywatności</Link>.
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu odpowiedzi na moje zapytanie. *
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="contact-form-submit"
                disabled={isSubmitting || !formData.acceptTerms}
                aria-label="Wyślij wiadomość"
              >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

