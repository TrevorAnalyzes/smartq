'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { plans, type PlanType } from '@/lib/plans'
import { Check } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('free')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    organizationName: '',
    organizationDomain: '',
  })

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    console.log('=== SIGNUP DEBUG ===')
    console.log('Selected Plan:', selectedPlan)
    console.log('Form Data:', formData)

    try {
      const supabase = createClient()

      // 1. Create Supabase Auth user
      console.log('Step 1: Creating Supabase auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      })

      if (authError) {
        console.error('Supabase auth error:', authError)
        throw authError
      }
      if (!authData.user) throw new Error('Failed to create user')
      console.log('Step 1: Supabase auth user created successfully')

      // 2. Create organization in Prisma database
      console.log('Step 2: Creating organization...')
      console.log('Organization payload:', {
        name: formData.organizationName,
        domain: formData.organizationDomain,
        plan: selectedPlan,
      })

      const orgResponse = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.organizationName,
          domain: formData.organizationDomain,
          plan: selectedPlan,
        }),
      })

      console.log('Organization response status:', orgResponse.status)
      console.log('Organization response ok:', orgResponse.ok)

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json()
        console.error('Organization creation failed:', errorData)
        console.error('Request body was:', {
          name: formData.organizationName,
          domain: formData.organizationDomain,
          plan: selectedPlan,
        })
        throw new Error(errorData.error || errorData.details || 'Failed to create organization')
      }

      const organization = await orgResponse.json()
      console.log('Organization created successfully:', organization)

      // 3. Create user record in Prisma database linked to organization
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          role: 'admin', // First user is always admin
          organizationId: organization.id,
          permissions: ['*'], // Full permissions for admin
        }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        console.error('User creation failed:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to create user profile')
      }

      // 4. Store organizationId in Supabase user metadata
      await supabase.auth.updateUser({
        data: {
          organizationId: organization.id,
        },
      })

      // Success! Redirect to dashboard
      router.push('/')
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Choose your plan and enter your details to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Plan Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Your Plan</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                      selectedPlan === plan.id
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                          Popular
                        </span>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-bold text-lg">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-bold">
                            {plan.price === 0 ? 'Free' : `$${plan.price}`}
                          </span>
                          {plan.price > 0 && (
                            <span className="text-sm text-muted-foreground">/month</span>
                          )}
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPlan === plan.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPlan === plan.id && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

                    <ul className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs">
                          <Check className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                            feature.included ? 'text-green-600' : 'text-gray-300'
                          }`} />
                          <span className={feature.included ? '' : 'text-muted-foreground line-through'}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Account Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Acme Inc"
                    value={formData.organizationName}
                    onChange={e => setFormData({ ...formData, organizationName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationDomain">Organization Domain</Label>
                <Input
                  id="organizationDomain"
                  type="text"
                  placeholder="acme (not acme.com)"
                  value={formData.organizationDomain}
                  onChange={e => setFormData({ ...formData, organizationDomain: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use a simple identifier like &quot;acme&quot; or &quot;mycompany&quot; (not a full domain)
                </p>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

