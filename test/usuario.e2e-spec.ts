import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Testes dos Módulos Usuario e Auth (e2e)', () => {
  let token: any;
  let usuarioId: any;
  let app: INestApplication<App>;
  let categoriaId: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + './../src/**/entities/*.entity.ts'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('01 - Deve Cadastrar um novo Usuário', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(201);

    usuarioId = resposta.body.id;
  });

  it('02 - Não Deve Cadastrar um Usuário Duplicado', async () => {
    await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(400);
  });

  it('03 - Deve Autenticar o Usuário (Login)', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/usuarios/logar')
      .send({
        usuario: 'root@root.com',
        senha: 'rootroot',
      })
      .expect(200);

    token = resposta.body.token;
  });

  it('04 - Deve Listar todos os Usuários', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/all')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('05 - Deve Atualizar um Usuário', async () => {
    return request(app.getHttpServer())
      .put('/usuarios/atualizar')
      .set('Authorization', `${token}`)
      .send({
        id: usuarioId,
        nome: 'Root Atualizado',
        usuario: 'root@root.com',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(200)
      .then((resposta) => {
        expect('Root Atualizado').toEqual(resposta.body.nome);
      });
  });

  it('06 - Deve Apresentar Erro ao Cadastrar o Usuário com um e-mail inválido', async () => {
    await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root',
        senha: 'rootroot',
        foto: '-',
      })
      .expect(400);
  });

  it('07 - Deve Apresentar Erro ao Cadastrar o Usuário com uma senha inválida', async () => {
    await request(app.getHttpServer())
      .post('/usuarios/cadastrar')
      .send({
        nome: 'Root',
        usuario: 'root@root',
        senha: 'rootroot0',
        foto: '-',
      })
      .expect(400);
  });

  it('08 - Deve Listar o Usuário por Id', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/1')
      .set('Authorization', `${token}`)
      .send({})
      .expect(200);
  });

  it('09 - Deve Apresentar Erro ao Listar o Usuário por um Id que não existe', async () => {
    return request(app.getHttpServer())
      .get('/usuarios/2')
      .set('Authorization', `${token}`)
      .send({})
      .expect(404);
  });

  it('10 - Deve conseguir criar uma nova categoria', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/categorias')
      .set('Authorization', `${token}`)
      .send({
        nome: 'categoria 01',
        descricao: 'nova categoria',
      })
      .expect(201);

    categoriaId = resposta.body.id;
  });

  it('11 - Deve conseguir criar uma nova postagem', async () => {
    await request(app.getHttpServer())
      .post('/produtos')
      .set('Authorization', `${token}`)
      .send({
        nome: 'produto 01',
        descricao: 'descricao do produto',
        preco: 12,
        disponivel: true,
        foto: 'https://picsum.photos/200?random=10.com.br',
        categoria: categoriaId,
        usuario: usuarioId,
      })
      .expect(201);
  });
});
