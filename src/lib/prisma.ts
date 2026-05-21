import { PrismaClient } from '@prisma/client'

const baseClient = new PrismaClient({
  log: process.env.NODE_ENV !== 'production' ? ['error'] : ['error'],
})

function getExtendedClient() {
  return baseClient.$extends({
    query: {
      async $allOperations({ model, operation, args, query }) {
        const start = performance.now()
        let retries = 3
        let delay = 150 // ms
        let lastError: any = null

        while (retries > 0) {
          try {
            const result = await query(args)
            const duration = performance.now() - start
            
            if (process.env.NODE_ENV !== 'production') {
              console.log(`[PRISMA] ${model ? `${model}.` : ''}${operation} took ${duration.toFixed(2)}ms`)
            } else if (duration > 1000) {
              console.warn(`[PRISMA][SLOW QUERY] ${model ? `${model}.` : ''}${operation} took ${duration.toFixed(2)}ms`)
            }
            
            return result
          } catch (error: any) {
            lastError = error
            
            // Identify transient connection / pool exhaustion / socket / timeout errors
            const isConnectionError = 
              error.code?.startsWith('P10') || 
              error.code === 'P2024' ||
              error.message?.toLowerCase().includes('connection') ||
              error.message?.toLowerCase().includes('timeout') ||
              error.message?.toLowerCase().includes('pool')
            
            if (isConnectionError && retries > 1) {
              console.warn(
                `[PRISMA][RETRY] Connection issue during ${model ? `${model}.` : ''}${operation}. Retrying in ${delay}ms... (Remaining attempts: ${retries - 1}). Error: ${error.message || error}`
              )
              await new Promise((resolve) => setTimeout(resolve, delay))
              retries--
              delay *= 2 // Exponential backoff
            } else {
              throw error
            }
          }
        }
        throw lastError
      }
    }
  })
}

type ExtendedClient = ReturnType<typeof getExtendedClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedClient | undefined
}

export const prisma = globalForPrisma.prisma ?? getExtendedClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


