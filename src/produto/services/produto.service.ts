import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, ILike, Repository } from 'typeorm';
import { CategoriaService } from '../../categoria/services/categoria.service';
import { UsuarioService } from '../../usuario/services/usuario.service';
import { Produto } from '../entities/produto.entity';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    private readonly categoriaService: CategoriaService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async findAll(): Promise<Produto[]> {
    return await this.produtoRepository.find({
      relations: {
        usuario: true,
        categoria: true,
      },
    });
  }
  async findById(id: number): Promise<Produto> {
    const produto = await this.produtoRepository.findOne({
      where: {
        id,
      },
      relations: {
        usuario: true,
        categoria: true,
      },
    });

    if (!produto) {
      throw new HttpException('Produto não encontrado', HttpStatus.NOT_FOUND);
    }
    return produto;
  }
  async findByName(nome: string): Promise<Produto[]> {
    return await this.produtoRepository.find({
      where: {
        nome: ILike(`%${nome}%`),
      },
      relations: {
        usuario: true,
        categoria: true,
      },
    });
  }

  async findByRestricao(restricao?: string): Promise<Produto[]> {
    // Cria uma query personalizada com o QueryBuilder
    const query = this.produtoRepository.createQueryBuilder('produto');

    // Se foi passada uma restrição, adiciona um filtro na descrição
    if (restricao) {
      query.where('LOWER(produto.descricao) LIKE :restricao', {
        restricao: `%${restricao.toLowerCase()}%`, // ex: %vegano%
      });
    }

    // Executa a consulta e retorna os resultados encontrados
    return query.getMany();
  }

  async create(produto: Produto): Promise<Produto> {
    if (produto.categoria) {
      const categoria = await this.categoriaService.findById(
        produto.categoria.id,
      );
      if (!categoria) {
        throw new HttpException(
          'Categoria não encontrada',
          HttpStatus.NOT_FOUND,
        );
      }
      const produtoBusca = await this.produtoRepository.findOne({
        where: {
          nome: produto.nome,
        },
      });

      if (produtoBusca != null) {
        throw new BadRequestException(`Produto já existe.`);
      }
      produto.categoria = categoria;
    }

    if (produto.usuario) {
      const usuario = await this.usuarioService.findById(produto.usuario.id);

      if (!usuario) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.NOT_FOUND,
        );
      }

      produto.usuario = usuario;
    }

    return await this.produtoRepository.save(produto);
  }
  async update(produto: Produto): Promise<Produto> {
    await this.findById(produto.id);

    if (produto.categoria) {
      const categoria = await this.categoriaService.findById(
        produto.categoria.id,
      );

      if (!categoria) {
        throw new HttpException(
          'Categoria não encontrada!',
          HttpStatus.NOT_FOUND,
        );
      }

      produto.categoria = categoria;
    }

    if (produto.usuario) {
      const usuario = await this.usuarioService.findById(produto.usuario.id);

      if (!usuario) {
        throw new HttpException(
          'Usuário não encontrado!',
          HttpStatus.NOT_FOUND,
        );
      }

      produto.usuario = usuario;
    }

    return await this.produtoRepository.save(produto);
  }

  async delete(id: number): Promise<DeleteResult> {
    await this.findById(id);

    return this.produtoRepository.delete(id);
  }
}
