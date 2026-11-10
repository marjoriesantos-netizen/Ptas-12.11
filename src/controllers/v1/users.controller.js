import { toUserDTO } from "../../dtos/user.dto.js";
import { UsersService } from "../../services/users.service.js";

export const listar = async (req, res, next) => {
  try {
    const users = await UsersService.listar();
    res.status(200).json(users.map(toUserDTO));
  } catch (error) {
    next(error);
  }
};

export const buscarPorId = async (req, res, next) => {
  try {
    const user = await UsersService.buscarPorId(req.params.id);
    res.status(200).json(toUserDTO(user));
  } catch (error) {
    next(error);
  }
};

export const criar = async (req, res, next) => {
  try {
    const user = await UsersService.criar(req.body);
    res.status(201).json(toUserDTO(user));
  } catch (error) {
    next(error);
  }
};

export const atualizar = async (req, res, next) => {
  try {
    const user = await UsersService.atualizar(req.params.id, req.body);
    res.status(200).json(toUserDTO(user));
  } catch (error) {
    next(error);
  }
};

export const remover = async (req, res, next) => {
  try {
    await UsersService.remover(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
