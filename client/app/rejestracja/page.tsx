'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/app/globals.css";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nazwisko jest wymagane';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Nieprawidłowy format email';
    }

    if (formData.phone && !/^(\+48)?[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Nieprawidłowy format numeru telefonu';
    }

    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć minimum 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, wielką literę i cyfrę';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Potwierdzenie hasła jest wymagane';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Musisz zaakceptować regulamin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Symulacja wysyłki formularza do API
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Registration submitted:', formData);
      setSubmitStatus('success');
      
      // Po 2 sekundach przekieruj do strony logowania
      setTimeout(() => {
        router.push('/konto');
      }, 2000);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, router]);

  const getPasswordStrength = useCallback((password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  }, []);

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLabels = ['Bardzo słabe', 'Słabe', 'Średnie', 'Silne', 'Bardzo silne'];
  const strengthColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  return (
    <>
      <Header />
      <main className="page-container">
        <div className="page-content register-page-content">
          <div className="register-header">
            <h1 className="page-title">Utwórz konto</h1>
            <p className="page-subtitle">
              Dołącz do Fryzjer Premium i ciesz się wyjątkowymi korzyściami
            </p>
          </div>

          <div className="register-benefits">
            <div className="register-benefit-item">
              <div className="register-benefit-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="register-benefit-text">
                <strong>Szybkie zakupy</strong>
                <span>Nie musisz za każdym razem podawać danych</span>
              </div>
            </div>
            <div className="register-benefit-item">
              <div className="register-benefit-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="register-benefit-text">
                <strong>Historia zamówień</strong>
                <span>Pełny wgląd w swoje zakupy</span>
              </div>
            </div>
            <div className="register-benefit-item">
              <div className="register-benefit-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="register-benefit-text">
                <strong>Ekskluzywne rabaty</strong>
                <span>Specjalne oferty tylko dla zarejestrowanych</span>
              </div>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
            {submitStatus === 'success' && (
              <div className="register-form-message register-form-message-success" role="alert">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Konto zostało utworzone!</strong>
                  <p>Za chwilę zostaniesz przekierowany do strony logowania...</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="register-form-message register-form-message-error" role="alert">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Wystąpił błąd</strong>
                  <p>Nie udało się utworzyć konta. Spróbuj ponownie później.</p>
                </div>
              </div>
            )}

            <div className="register-form-section">
              <h2 className="register-form-section-title">Dane osobowe</h2>
              
              <div className="register-form-row">
                <div className="register-form-field">
                  <label htmlFor="register-firstName" className="register-form-label">
                    Imię *
                  </label>
                  <input
                    id="register-firstName"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`register-form-input ${errors.firstName ? 'register-form-input-error' : ''}`}
                    placeholder="Jan"
                    autoComplete="given-name"
                  />
                  {errors.firstName && (
                    <span className="register-form-error">{errors.firstName}</span>
                  )}
                </div>

                <div className="register-form-field">
                  <label htmlFor="register-lastName" className="register-form-label">
                    Nazwisko *
                  </label>
                  <input
                    id="register-lastName"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`register-form-input ${errors.lastName ? 'register-form-input-error' : ''}`}
                    placeholder="Kowalski"
                    autoComplete="family-name"
                  />
                  {errors.lastName && (
                    <span className="register-form-error">{errors.lastName}</span>
                  )}
                </div>
              </div>

              <div className="register-form-row">
                <div className="register-form-field">
                  <label htmlFor="register-email" className="register-form-label">
                    Adres e-mail *
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`register-form-input ${errors.email ? 'register-form-input-error' : ''}`}
                    placeholder="jan.kowalski@example.com"
                    autoComplete="email"
                  />
                  {errors.email && (
                    <span className="register-form-error">{errors.email}</span>
                  )}
                </div>

                <div className="register-form-field">
                  <label htmlFor="register-phone" className="register-form-label">
                    Numer telefonu <span className="register-form-optional">(opcjonalnie)</span>
                  </label>
                  <input
                    id="register-phone"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`register-form-input ${errors.phone ? 'register-form-input-error' : ''}`}
                    placeholder="+48 123 456 789"
                    autoComplete="tel"
                  />
                  {errors.phone && (
                    <span className="register-form-error">{errors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="register-form-section">
              <h2 className="register-form-section-title">Bezpieczeństwo</h2>
              
              <div className="register-form-row">
                <div className="register-form-field">
                  <label htmlFor="register-password" className="register-form-label">
                    Hasło *
                  </label>
                  <div className="register-form-password-wrapper">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`register-form-input ${errors.password ? 'register-form-input-error' : ''}`}
                      placeholder="Minimum 8 znaków"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="register-form-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showPassword ? (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="register-form-password-strength">
                      <div className="register-form-password-strength-bar">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="register-form-password-strength-segment"
                            style={{
                              backgroundColor: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb'
                            }}
                          />
                        ))}
                      </div>
                      <span 
                        className="register-form-password-strength-text"
                        style={{ color: strengthColors[passwordStrength - 1] || '#6b7280' }}
                      >
                        {passwordStrength > 0 ? strengthLabels[passwordStrength - 1] : 'Wpisz hasło'}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <span className="register-form-error">{errors.password}</span>
                  )}
                </div>

                <div className="register-form-field">
                  <label htmlFor="register-confirmPassword" className="register-form-label">
                    Powtórz hasło *
                  </label>
                  <div className="register-form-password-wrapper">
                    <input
                      id="register-confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`register-form-input ${errors.confirmPassword ? 'register-form-input-error' : ''}`}
                      placeholder="Powtórz hasło"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="register-form-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                    >
                      {showConfirmPassword ? (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <span className="register-form-success">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Hasła są identyczne
                    </span>
                  )}
                  {errors.confirmPassword && (
                    <span className="register-form-error">{errors.confirmPassword}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="register-form-section register-form-section-consents">
              <h2 className="register-form-section-title">Zgody</h2>
              
              <div className="register-form-checkbox-group">
                <label className="register-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="register-form-checkbox-input"
                  />
                  <span className="register-form-checkbox-checkmark"></span>
                  <span className="register-form-checkbox-text">
                    Akceptuję <Link href="/regulamin" className="register-form-link" target="_blank">regulamin sklepu</Link> oraz{' '}
                    <Link href="/polityka-prywatnosci" className="register-form-link" target="_blank">politykę prywatności</Link>. *
                  </span>
                </label>
                {errors.acceptTerms && (
                  <span className="register-form-error register-form-error-checkbox">{errors.acceptTerms}</span>
                )}
              </div>

              <div className="register-form-checkbox-group">
                <label className="register-form-checkbox-label">
                  <input
                    type="checkbox"
                    name="acceptMarketing"
                    checked={formData.acceptMarketing}
                    onChange={handleInputChange}
                    className="register-form-checkbox-input"
                  />
                  <span className="register-form-checkbox-checkmark"></span>
                  <span className="register-form-checkbox-text">
                    Chcę otrzymywać informacje o nowościach, promocjach i ekskluzywnych ofertach na podany adres e-mail.
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="register-form-submit"
              disabled={isSubmitting || submitStatus === 'success'}
            >
              {isSubmitting ? (
                <>
                  <svg className="register-form-spinner" viewBox="0 0 24 24" width="20" height="20">
                    <circle className="register-form-spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
                  </svg>
                  Tworzenie konta...
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Konto utworzone!
                </>
              ) : (
                'Utwórz konto'
              )}
            </button>

            <div className="register-form-login">
              <p className="register-form-login-text">
                Masz już konto?{' '}
                <Link href="/konto" className="register-form-login-link">
                  Zaloguj się
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

