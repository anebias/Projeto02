import { expect, it, beforeAll, afterAll, describe } from 'vitest'
import { execSync } from 'node:child_process'
import req from 'supertest'
import { app } from '../src/app'
import { beforeEach } from 'node:test'

describe('transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })
  it('o usuario consegue enviar uma transação', async () => {
    const res = await req(app.server).post('/transactions').send({
      title: 'nova transação',
      amount: 5000,
      type: 'credit',
    })
    // validação

    expect(res.statusCode).toEqual(201)
  })

  it('deve ser possível listar todas as transações', async () => {
    const createTransactionResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'nova transação',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    console.log(cookies)

    const listTransactionsResponse = await req(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'nova transação',
        amount: 5000,
      }),
    ])
  })

  it('deve ser possível listar uma transação específica', async () => {
    const createTransactionResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'nova transação',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await req(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsResponse = await req(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'nova transação',
        amount: 5000,
      }),
    )
  })

  it('deve ser possível resumir todas as transações', async () => {
    const createTransactionResponse = await req(app.server)
      .post('/transactions')
      .send({
        title: 'nova transação',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    await req(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'transação débito',
        amount: 1500,
        type: 'debit',
      })

    const summaryResponse = await req(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 3500
    })
  })


})
