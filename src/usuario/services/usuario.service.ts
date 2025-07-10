import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Repository } from 'typeorm';
//import { Bcrypt } from '../../auth/bcrypt/bcrypt';
// descomentar linha 5, 50 e 64 quando implementar auth

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return await this.usuarioRepository.find({
      relations: {
        produto: true,
      },
    });
  }

  async findById(id: number) {
    const buscaUsuario = await this.usuarioRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        produto: true,
      },
    });

    if (!buscaUsuario) {
      throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
    }

    return buscaUsuario;
  }

  async findByUsuario(usuario: string): Promise<Usuario | null> {
    const buscaUsuario = await this.usuarioRepository.findOne({
      where: {
        usuario: usuario,
      },
    });

    return buscaUsuario;
  }

  async create(usuario: Usuario): Promise<Usuario> {
    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario) {
      throw new HttpException('Usuário já existe', HttpStatus.BAD_REQUEST);
    }

    // usuario.senha = await bcrypt.criptografarSenha(usuario.senha);
    return await this.usuarioRepository.save(usuario);
  }

  async update(usuario: Usuario): Promise<Usuario> {
    await this.findById(usuario.id);

    const buscaUsuario = await this.findByUsuario(usuario.usuario);

    if (buscaUsuario && buscaUsuario.id !== usuario.id) {
      throw new HttpException(
        'Usuário (e-mail) já Cadastrado!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // usuario.senha = await bcrypt.criptografarSenha(usuario.senha);
    return await this.usuarioRepository.save(usuario);
  }
}
